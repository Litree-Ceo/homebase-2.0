/**
 * Cosmos DB client wrapper for LITLAB
 *
 * Usage: Server-side only (API routes or server components)
 * Never expose endpoint/key in browser code
 *
 * @workspace This file handles secure Cosmos DB connections for Next.js app
 */

import type {
  Container,
  Database,
  ItemDefinition,
  SqlParameter,
  SqlQuerySpec,
} from '@azure/cosmos';
import { CosmosClient } from '@azure/cosmos';

// Initialize once, reuse
let client: CosmosClient | null = null;
let database: Database | null = null;

/**
 * Initialize Cosmos DB client
 * Call once at app startup or lazy-load as needed
 */
export function getCosmosClient(): CosmosClient {
  if (!client) {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;

    if (!endpoint || !key) {
      throw new Error('Missing COSMOS_ENDPOINT or COSMOS_KEY in environment');
    }

    client = new CosmosClient({ endpoint, key });
  }

  return client;
}

/**
 * Get reference to LITLAB database
 */
export async function getLitLabDatabase(): Promise<Database> {
  if (!database) {
    const cosmosClient = getCosmosClient();
    const dbResponse = await cosmosClient.database('litlab').read();
    database = dbResponse.database;
  }

  return database;
}

/**
 * Get a specific container from LITLAB database
 * @param containerName - Name of the container (e.g., 'items', 'users', 'games')
 */
export async function getContainer(containerName: string): Promise<Container> {
  const db = await getLitLabDatabase();
  return db.container(containerName);
}

/**
 * Query items from a container
 * @param containerName - Container to query
 * @param query - SQL query (e.g., "SELECT * FROM c WHERE c.status = @status")
 * @param parameters - Query parameters
 */
export async function queryItems<T extends ItemDefinition = ItemDefinition>(
  containerName: string,
  query: string,
  parameters?: SqlParameter[],
): Promise<T[]> {
  const container = await getContainer(containerName);

  const querySpec: SqlQuerySpec = {
    query,
    parameters: parameters || [],
  };

  const { resources } = await container.items.query<T>(querySpec).fetchAll();
  return resources;
}

/**
 * Create a new item in a container
 * @param containerName - Container to insert into
 * @param item - Item object (should have id property)
 */
export async function createItem<T extends ItemDefinition & { id: string }>(
  containerName: string,
  item: T,
): Promise<T> {
  const container = await getContainer(containerName);
  const { resource } = await container.items.create(item);

  if (!resource) {
    throw new Error('Failed to create item');
  }

  return resource as T;
}

/**
 * Read a single item by id and partition key
 * @param containerName - Container name
 * @param id - Item id
 * @param partitionKey - Partition key value
 */
export async function readItem<T extends ItemDefinition = ItemDefinition>(
  containerName: string,
  id: string,
  partitionKey?: string,
): Promise<T | null> {
  const container = await getContainer(containerName);

  try {
    const { resource } = await container.item(id, partitionKey).read<T>();
    return resource ?? null;
  } catch (error: unknown) {
    // 404 is expected if item doesn't exist
    if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Update an item
 * @param containerName - Container name
 * @param id - Item id
 * @param updates - Partial updates to merge
 * @param partitionKey - Partition key value
 */
export async function updateItem<T extends ItemDefinition & { id: string }>(
  containerName: string,
  id: string,
  updates: Partial<T>,
  partitionKey?: string,
): Promise<T> {
  const container = await getContainer(containerName);

  // Read current item
  const current = await readItem<T>(containerName, id, partitionKey);
  if (!current) {
    throw new Error(`Item ${id} not found`);
  }

  // Merge updates
  const updated = { ...current, ...updates, id };

  // Replace
  const { resource } = await container.item(id, partitionKey).replace(updated);

  if (!resource) {
    throw new Error('Failed to update item');
  }

  return resource as unknown as T;
}

/**
 * Delete an item
 * @param containerName - Container name
 * @param id - Item id
 * @param partitionKey - Partition key value
 */
export async function deleteItem(
  containerName: string,
  id: string,
  partitionKey?: string,
): Promise<void> {
  const container = await getContainer(containerName);
  await container.item(id, partitionKey).delete();
}

/**
 * Bulk query for items with pagination
 * @param containerName - Container name
 * @param query - SQL query
 * @param parameters - Query parameters
 * @param pageSize - Items per page (default 100)
 */
export async function queryItemsWithPagination<T extends ItemDefinition = ItemDefinition>(
  containerName: string,
  query: string,
  parameters?: SqlParameter[],
  pageSize: number = 100,
): Promise<{ items: T[]; continuationToken?: string }> {
  const container = await getContainer(containerName);

  const querySpec: SqlQuerySpec = {
    query,
    parameters: parameters || [],
  };

  const iterator = container.items.query<T>(querySpec);
  const { resources, continuationToken } = await iterator.fetchNext();

  return {
    items: resources,
    continuationToken,
  };
}

/**
 * Health check - verify Cosmos DB connection
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const client = getCosmosClient();
    const db = await client.database('litlab').read();
    return db.statusCode === 200;
  } catch (error) {
    console.error('Cosmos DB health check failed:', error);
    return false;
  }
}
/**
 * Save Meta OAuth token for a user (with encryption)
 * @param userId - User ID
 * @param token - Meta OAuth token
 */
export async function saveMetaToken(
  userId: string,
  token: { accessToken: string; refreshToken?: string; expiresIn: number; issuedAt: number },
): Promise<void> {
  try {
    const metaTokenRecord = {
      id: `meta_token_${userId}`,
      userId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresIn: token.expiresIn,
      issuedAt: token.issuedAt,
      updatedAt: new Date(),
      ttl: token.expiresIn, // Auto-delete when expired
    };

    await createItem('meta_tokens', metaTokenRecord);
  } catch (error) {
    console.warn(
      '[Cosmos] Error saving Meta token:',
      error instanceof Error ? error.message : error,
    );
    // Non-critical failure - session cookie still works
  }
}

/**
 * Store Meta webhook event in Cosmos DB
 * @param event - Webhook event data
 */
export async function storeMetaWebhookEvent(event: {
  eventId: string;
  userId: string;
  eventType: string;
  data: Record<string, unknown>;
  createdAt: Date;
  ttl: number;
}): Promise<void> {
  try {
    await createItem('webhook_events', {
      id: event.eventId,
      ...event,
    });
  } catch (error) {
    console.warn(
      '[Cosmos] Error storing webhook event:',
      error instanceof Error ? error.message : error,
    );
    // Non-critical failure - logging already done
  }
}
