@description('The name of the Static Web App')
param name string = 'homebase2-${uniqueString(resourceGroup().id)}'

@description('The location for the Static Web App')
param location string = resourceGroup().location

@description('The SKU of the Static Web App')
@allowed([
  'Free'
  'Standard'
])
param sku string = 'Free'

@description('The repository URL for the Static Web App')
param repositoryUrl string

@description('The branch name for the Static Web App')
param branch string = 'main'

resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: name
  location: location
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    buildProperties: {
      appLocation: '/client'
      apiLocation: '/api'
      appArtifactLocation: 'dist'
    }
  }
}

output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output staticWebAppResourceId string = staticWebApp.id
