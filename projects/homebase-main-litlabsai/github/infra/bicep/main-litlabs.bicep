// ============================================================================
// LITLABS Infrastructure - Main Orchestration
// ============================================================================

@description('Environment name')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'prod'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Project name prefix')
param projectName string = 'litlabs'

@description('Custom domain for Front Door')
param customDomain string = 'www.litlabs.com'

// ============================================================================
// Variables
// ============================================================================

var resourcePrefix = '${projectName}-${environment}'
var tags = {
  project: projectName
  environment: environment
  managedBy: 'bicep'
}

// Resource names
var cosmosAccountName = '${resourcePrefix}-cosmos'
var databaseName = '${resourcePrefix}-db'
var storageAccountName = replace('${resourcePrefix}sa', '-', '')
var keyVaultName = '${resourcePrefix}-kv'
var functionAppName = '${resourcePrefix}-func'
var workspaceName = '${resourcePrefix}-log'
var appInsightsName = '${resourcePrefix}-ai'
var frontDoorName = '${resourcePrefix}-fd'
var wafPolicyName = '${resourcePrefix}-waf'

// ============================================================================
// Monitoring (deploy first for diagnostic settings)
// ============================================================================

module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring-deployment'
  params: {
    location: location
    workspaceName: workspaceName
    appInsightsName: appInsightsName
    tags: tags
  }
}

// ============================================================================
// Cosmos DB
// ============================================================================

module cosmos './modules/cosmos.bicep' = {
  name: 'cosmos-deployment'
  params: {
    location: location
    accountName: cosmosAccountName
    databaseName: databaseName
    tags: tags
  }
}

// ============================================================================
// Storage Account
// ============================================================================

module storage './modules/storage.bicep' = {
  name: 'storage-deployment'
  params: {
    location: location
    storageAccountName: storageAccountName
    tags: tags
  }
}

// ============================================================================
// Key Vault
// ============================================================================

module keyVault './modules/keyvault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    location: location
    keyVaultName: keyVaultName
    tags: tags
  }
}

// ============================================================================
// Function App
// ============================================================================

module functionApp './modules/function-app.bicep' = {
  name: 'functionapp-deployment'
  params: {
    location: location
    functionAppName: functionAppName
    storageAccountName: storage.outputs.storageAccountName
    keyVaultUri: keyVault.outputs.keyVaultUri
    cosmosEndpoint: cosmos.outputs.cosmosEndpoint
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    tags: tags
  }
}

// ============================================================================
// Front Door with WAF
// ============================================================================

module frontDoor './modules/frontdoor.bicep' = {
  name: 'frontdoor-deployment'
  params: {
    frontDoorName: frontDoorName
    wafPolicyName: wafPolicyName
    functionAppHostname: functionApp.outputs.functionAppHostname
    customDomain: customDomain
    tags: tags
  }
}

// ============================================================================
// Outputs
// ============================================================================

output cosmosEndpoint string = cosmos.outputs.cosmosEndpoint
output storageAccountName string = storage.outputs.storageAccountName
output keyVaultUri string = keyVault.outputs.keyVaultUri
output functionAppName string = functionApp.outputs.functionAppName
output functionAppUrl string = functionApp.outputs.functionAppUrl
output frontDoorEndpoint string = frontDoor.outputs.frontDoorEndpoint
output appInsightsId string = monitoring.outputs.appInsightsId
