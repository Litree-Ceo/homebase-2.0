/**
 * Cosmos DB Client Singleton
 * @workspace Shared Azure Cosmos DB connection
 */

import { CosmosClient } from '@azure/cosmos';

let cosmosClient: CosmosClient | null = null;

export function getCosmosClient(): CosmosClient {
  if (!cosmosClient) {
    const endpoint = process.env.COSMOS_ENDPOINT || '';
    const key = process.env.COSMOS_KEY || '';

    if (!endpoint || !key) {
      throw new Error('COSMOS_ENDPOINT and COSMOS_KEY must be set');
    }

    cosmosClient = new CosmosClient({ endpoint, key });
  }

  return cosmosClient;
}
