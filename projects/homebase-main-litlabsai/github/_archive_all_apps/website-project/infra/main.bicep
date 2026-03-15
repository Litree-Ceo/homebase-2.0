param location string = resourceGroup().location
param copilotAppName string
param appServicePlanName string

resource plan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true // Linux
  }
}

resource copilot 'Microsoft.Web/sites@2022-03-01' = {
  name: copilotAppName
  location: location
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        { name: 'WEBSITES_PORT', value: '8080' },
        { name: 'NODE_ENV', value: 'production' }
      ]
    }
    httpsOnly: true
  }
}
