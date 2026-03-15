// Azure Bicep template for LiTreeLab Studio
// Deploys: Container Registry + App Service Plan + App Service (Container)

@description('Location for all resources')
param location string = resourceGroup().location

@description('Application name (used for resource naming)')
param appName string = 'litreelabstudio'

@description('Environment name')
param environment string = 'prod'

@description('Container Registry SKU')
@allowed(['Basic', 'Standard', 'Premium'])
param registrySku string = 'Basic'

@description('App Service Plan SKU')
@allowed(['B1', 'B2', 'B3', 'S1', 'S2', 'S3', 'P1v2', 'P2v2', 'P3v2'])
param appServiceSku string = 'B1'

// Variables
var registryName = '${appName}acr'
var appServicePlanName = '${appName}-plan-${environment}'
var appServiceName = '${appName}-${environment}'
var imageName = '${appName}:latest'

// Azure Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  sku: {
    name: registrySku
  }
  properties: {
    adminUserEnabled: true
    policies: {
      trustPolicy: {
        status: 'disabled'
        type: 'Notary'
      }
      retentionPolicy: {
        status: 'enabled'
        days: 7
      }
    }
  }
}

// App Service Plan (Linux)
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  sku: {
    name: appServiceSku
    tier: appServiceSku == 'B1' || appServiceSku == 'B2' || appServiceSku == 'B3' ? 'Basic' : appServiceSku == 'S1' || appServiceSku == 'S2' || appServiceSku == 'S3' ? 'Standard' : 'PremiumV2'
    size: appServiceSku
    family: appServiceSku == 'B1' || appServiceSku == 'B2' || appServiceSku == 'B3' ? 'B' : appServiceSku == 'S1' || appServiceSku == 'S2' || appServiceSku == 'S3' ? 'S' : 'Pv2'
    capacity: 1
  }
  properties: {
    reserved: true
    perSiteScaling: false
    targetWorkerCount: 0
    targetWorkerSizeId: 0
  }
}

// App Service (Linux Container)
resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: appServiceName
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      numberOfWorkers: 1
      alwaysOn: true
      linuxFxVersion: 'DOCKER|${containerRegistry.properties.loginServer}/${imageName}'
      appSettings: [
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${containerRegistry.properties.loginServer}'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: containerRegistry.listCredentials().username
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'PORT'
          value: '8000'
        }
        {
          name: 'WEBSITES_PORT'
          value: '8000'
        }
        {
          name: 'ENVIRONMENT'
          value: environment
        }
      ]
    }
    httpsOnly: true
  }
}

// Output values
output appServiceName string = appService.name
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output containerRegistryName string = containerRegistry.name
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
