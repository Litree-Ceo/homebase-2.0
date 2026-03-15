param location string = 'eastus2'
param envName string = 'litrelab-${uniqueString(resourceGroup().id)}'

// 1. Log Analytics Workspace (for monitoring)
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-${envName}'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
  }
}

// 2. Container Apps Environment (Serverless host)
resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-${envName}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// 3. Azure Container Registry (To store the Docker image)
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: replace('acr${envName}', '-', '')
  location: location
  sku: { name: 'Basic' }
  properties: {
    adminUserEnabled: true
  }
}

// Outputs needed for GitHub Actions or local CLI deployment
output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
output envName string = containerAppEnv.name
output envId string = containerAppEnv.id
