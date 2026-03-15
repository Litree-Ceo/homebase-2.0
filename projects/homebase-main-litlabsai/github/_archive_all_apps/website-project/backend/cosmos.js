// Cosmos DB integration with Azure Key Vault support
const { CosmosClient } = require("@azure/cosmos");
const { getSecret } = require("./keyvault");

let client;
async function getClient() {
  if (client) return client;
  let endpoint = process.env.COSMOS_DB_ENDPOINT;
  let key = process.env.COSMOS_DB_KEY;
  // If Key Vault is configured, prefer secrets from there
  if (process.env.KEY_VAULT_URL) {
    try {
      endpoint = await getSecret("COSMOS-DB-ENDPOINT");
      key = await getSecret("COSMOS-DB-KEY");
    } catch (e) {
      // fallback to env if Key Vault fails
    }
  }
  client = new CosmosClient({ endpoint, key });
  return client;
}

module.exports = { getClient };
