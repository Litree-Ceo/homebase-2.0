param location string = 'eastus'
param resourceGroupName string = 'litreelabstudio-rg'
param cosmosAccountName string = 'litlab-cosmos'
param keyVaultName string = 'kvprodlitree14210'
param functionAppName string = 'litlabs-func-app-prod'
param functionStorageAccountName string = 'litlabsfuncsa'
param blobStorageAccountName string = 'litlabsblobsa'
@secure()
param signalrConnection string
@secure()
param grokApiKey string

module cosmos './cosmos.bicep' = {
  name: 'cosmos'
  params: {
    location: location
    cosmosAccountName: cosmosAccountName
  }
}

module blobStorage './storage.bicep' = {
  name: 'blobStorage'
  params: {
    location: location
    storageAccountName: blobStorageAccountName
  }
}

module functionApp './function-app.bicep' = {
  name: 'functionApp'
  params: {
    location: location
    keyVaultName: keyVaultName
    functionAppName: functionAppName
    storageAccountName: functionStorageAccountName
    cosmosDbEndpoint: cosmos.outputs.cosmosEndpoint
    signalrConnection: signalrConnection
    grokApiKey: grokApiKey
  }
}

output cosmosEndpoint string = cosmos.outputs.cosmosEndpoint
output functionAppUrl string = functionApp.outputs.functionAppUrl
output keyVaultId string = functionApp.outputs.keyVaultId
