// Azure Key Vault integration for secure secret loading
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const keyVaultUrl = process.env.KEY_VAULT_URL; // e.g. https://your-keyvault-name.vault.azure.net

let client;
if (keyVaultUrl) {
  const credential = new DefaultAzureCredential();
  client = new SecretClient(keyVaultUrl, credential);
}

async function getSecret(secretName) {
  if (!client) throw new Error("Key Vault client not configured");
  const secret = await client.getSecret(secretName);
  return secret.value;
}

module.exports = { getSecret };
