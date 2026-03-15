using 'main-litlabs.bicep'

// ============================================================================
// LITLABS Infrastructure Parameters - Production
// ============================================================================

param environment = 'prod'
param location = 'eastus'
param projectName = 'litlabs'
param customDomain = 'www.litlabs.com'

// Add your Azure AD admin object IDs for Key Vault access
param adminObjectIds = [
  // Add admin object IDs here
  // '00000000-0000-0000-0000-000000000000'
]

// Secrets are provided via deployment parameters or Key Vault references
// Do not store actual secrets in this file
