// ai-platform-baseline.bicep
// Minimal, deployable Azure baseline for website-project

param location string = resourceGroup().location
// param swaProdName string = 'litlab-swa-prod'
param funcApiName string = 'litlab-func-api'
param backendAppName string = 'litlab-app-backend'
param copilotAppName string = 'litlab-app-copilot'
param signalrName string = 'litlab-signalr'
param cosmosName string = 'litlab-cosmos'
param storageName string = 'litlabstorage'
param keyVaultName string = 'litlab-kv'
param appInsightsName string = 'litlab-insights'

// Static Web App resource is commented out. Uncomment and configure if needed.

resource funcApi 'Microsoft.Web/sites@2023-01-01' = {
  name: funcApiName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    siteConfig: {
      linuxFxVersion: 'NODE|20'
    }
    httpsOnly: true
  }
}

resource backendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: backendAppName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    siteConfig: {
      linuxFxVersion: 'NODE|20'
    }
    httpsOnly: true
  }
}

resource copilotApp 'Microsoft.Web/sites@2023-01-01' = {
  name: copilotAppName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    siteConfig: {
      linuxFxVersion: 'NODE|20'
    }
    httpsOnly: true
  }
}

resource signalr 'Microsoft.SignalRService/SignalR@2023-08-01-preview' = {
  name: signalrName
  location: location
  sku: {
    name: 'Standard_S1'
    capacity: 1
  }
  properties: {
    features: [
      {
        flag: 'ServiceMode'
        value: 'Default'
      }
    ]
  }
}

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: []
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: true
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

// ============ //
// Outputs      //
// ============ //

@description('The name of the resource group the module was deployed to.')
output resourceGroupName string = resourceGroup().name

@description('The location the module was deployed to.')
output location string = location

// @description('The name of the Static Web App.')
// output swaProdNameOut string = swaProd.name

@description('The name of the Function App.')
output funcApiNameOut string = funcApi.name

@description('The name of the Backend App.')
output backendAppNameOut string = backendApp.name

@description('The name of the Copilot App.')
output copilotAppNameOut string = copilotApp.name

@description('The name of the SignalR Service.')
output signalrNameOut string = signalr.name

@description('The name of the Cosmos DB Account.')
output cosmosNameOut string = cosmos.name

@description('The name of the Storage Account.')
output storageNameOut string = storage.name

@description('The name of the Application Insights.')
output appInsightsNameOut string = appInsights.name
