/**
 * LITLABS API - Cosmos DB Integration Functions
 * CRUD operations for Cosmos DB with proper partition key handling
 */
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { CosmosClient, Database, Container } from "@azure/cosmos";
import { registerEpipeHandler } from "../shared/epipe";

// Singleton client (reuse across invocations)
let cosmosClient: CosmosClient | null = null;
let database: Database | null = null;

registerEpipeHandler();

function getCosmosClient(): CosmosClient {
  if (!cosmosClient) {
    const endpoint = process.env.COSMOS_ENDPOINT!;
    const key = process.env.COSMOS_KEY!;

    cosmosClient = new CosmosClient({ endpoint, key });
  }
  return cosmosClient;
}

async function getDatabase(): Promise<Database> {
  if (!database) {
    const client = getCosmosClient();
    const dbName = process.env.COSMOS_DATABASE || "litlabs-db";
    const { database: db } = await client.databases.createIfNotExists({
      id: dbName,
    });
    database = db;
  }
  return database;
}

async function getContainer(containerName: string): Promise<Container> {
  const db = await getDatabase();
  const { container } = await db.containers.createIfNotExists({
    id: containerName,
    partitionKey: { paths: ["/partitionKey"] },
  });
  return container;
}

// GET /api/cosmos/{container}?partitionKey=xxx
export async function cosmosGet(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const containerName = request.params.container;
    const partitionKey = request.query.get("partitionKey");

    if (!containerName) {
      return { status: 400, jsonBody: { error: "Container name required" } };
    }

    const container = await getContainer(containerName);

    let query = "SELECT * FROM c";
    const parameters: { name: string; value: string }[] = [];

    if (partitionKey) {
      query += " WHERE c.partitionKey = @partitionKey";
      parameters.push({ name: "@partitionKey", value: partitionKey });
    }

    const { resources } = await container.items
      .query({ query, parameters })
      .fetchAll();

    return {
      status: 200,
      jsonBody: { items: resources, count: resources.length },
    };
  } catch (error: any) {
    context.error("Cosmos GET error:", error);
    return { status: 500, jsonBody: { error: error.message } };
  }
}

// POST /api/cosmos/{container}
export async function cosmosCreate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const containerName = request.params.container;
    const body = (await request.json()) as Record<string, any>;

    if (!containerName) {
      return { status: 400, jsonBody: { error: "Container name required" } };
    }

    if (!body.partitionKey) {
      return {
        status: 400,
        jsonBody: { error: "partitionKey field required in body" },
      };
    }

    const container = await getContainer(containerName);
    const { resource } = await container.items.create(body);

    context.log(`Created item in ${containerName}:`, resource?.id);

    return {
      status: 201,
      jsonBody: resource,
    };
  } catch (error: any) {
    context.error("Cosmos CREATE error:", error);
    return { status: 500, jsonBody: { error: error.message } };
  }
}

// PUT /api/cosmos/{container}/{id}?partitionKey=xxx
export async function cosmosUpdate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const containerName = request.params.container;
    const id = request.params.id;
    const partitionKey = request.query.get("partitionKey");
    const body = (await request.json()) as Record<string, any>;

    if (!containerName || !id || !partitionKey) {
      return {
        status: 400,
        jsonBody: { error: "Container, id, and partitionKey required" },
      };
    }

    const container = await getContainer(containerName);
    const { resource } = await container.item(id, partitionKey).replace(body);

    return {
      status: 200,
      jsonBody: resource,
    };
  } catch (error: any) {
    context.error("Cosmos UPDATE error:", error);
    return { status: 500, jsonBody: { error: error.message } };
  }
}

// DELETE /api/cosmos/{container}/{id}?partitionKey=xxx
export async function cosmosDelete(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const containerName = request.params.container;
    const id = request.params.id;
    const partitionKey = request.query.get("partitionKey");

    if (!containerName || !id || !partitionKey) {
      return {
        status: 400,
        jsonBody: { error: "Container, id, and partitionKey required" },
      };
    }

    const container = await getContainer(containerName);
    await container.item(id, partitionKey).delete();

    return {
      status: 204,
    };
  } catch (error: any) {
    context.error("Cosmos DELETE error:", error);
    return { status: 500, jsonBody: { error: error.message } };
  }
}

// Register HTTP endpoints
app.http("cosmos-get", {
  methods: ["GET"],
  authLevel: "function",
  route: "cosmos/{container}",
  handler: cosmosGet,
});

app.http("cosmos-create", {
  methods: ["POST"],
  authLevel: "function",
  route: "cosmos/{container}",
  handler: cosmosCreate,
});

app.http("cosmos-update", {
  methods: ["PUT"],
  authLevel: "function",
  route: "cosmos/{container}/{id}",
  handler: cosmosUpdate,
});

app.http("cosmos-delete", {
  methods: ["DELETE"],
  authLevel: "function",
  route: "cosmos/{container}/{id}",
  handler: cosmosDelete,
});
