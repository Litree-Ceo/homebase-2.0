import { Container, CosmosClient, Database } from "@azure/cosmos";

// @ts-nocheck

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE;
const containerId = process.env.COSMOS_DB_CONTAINER;

if (!endpoint || !key || !databaseId || !containerId) {
  throw new Error(
    "Missing Cosmos DB environment variables. Please check your .env.local file.",
  );
}

const client = new CosmosClient({ endpoint, key });
const database: Database = client.database(databaseId);
const container: Container = database.container(containerId);

export { client, container, database };

// Query items from Cosmos DB
export async function queryItems<T>(
  query: string,
  parameters: any[] = [],
): Promise<T[]> {
  try {
    const { resources } = await container.items
      .query({ query, parameters })
      .fetchAll();
    return resources as T[];
  } catch (error) {
    console.error("Cosmos DB queryItems error:", error);
    throw error;
  }
}

// Create an item in Cosmos DB
export async function createItem<T>(item: T): Promise<T> {
  try {
    const { resource } = await container.items.create(item);
    return resource as T;
  } catch (error) {
    console.error("Cosmos DB createItem error:", error);
    throw error;
  }
}
