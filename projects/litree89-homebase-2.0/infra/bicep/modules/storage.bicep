// storage.bicep - Azure Storage Account for Blobs

@description('Location for storage')
param location string

@description('Storage account name (3-24 chars, lowercase, no hyphens)')
param storageAccountName string

@description('Resource tags')
param tags object = {}

// ==============================================================================
// Storage Account
// ==============================================================================
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  tags: tags
  properties: {
    // @cost-optimized: Switched from Hot to Cool tier (saves ~$15-20/month)
    // Cool tier ideal for infrequent access; blobs cached at Front Door anyway
    accessTier: 'Cool'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
    encryption: {
      services: {
        blob: {
          enabled: true
          keyType: 'Account'
        }
        file: {
          enabled: true
          keyType: 'Account'
        }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

// ==============================================================================
// Blob Services
// ==============================================================================
resource blobServices 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: 7
    }
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 7
    }
    cors: {
      corsRules: [
        {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          exposedHeaders: ['*']
          maxAgeInSeconds: 3600
        }
      ]
    }
  }
}

// ==============================================================================
// Containers
// ==============================================================================
resource uploadsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobServices
  name: 'uploads'
  properties: {
    publicAccess: 'None'
    metadata: {
      purpose: 'User file uploads'
    }
  }
}

resource assetsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobServices
  name: 'assets'
  properties: {
    publicAccess: 'Blob'
    metadata: {
      purpose: 'Public static assets'
    }
  }
}

resource backupsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobServices
  name: 'backups'
  properties: {
    publicAccess: 'None'
    metadata: {
      purpose: 'Database and config backups'
    }
  }
}

// ==============================================================================
// Outputs
// ==============================================================================
output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
output blobEndpoint string = storageAccount.properties.primaryEndpoints.blob
// Note: Connection string with keys should be retrieved at runtime via Key Vault or managed identity
