// Bicep for Front Door + WAF for LITLABS production
// Provides: DDoS protection, bot filtering, rate limiting, JS challenge, geo filtering

targetScope = 'resourceGroup'

param environment string = 'prod'
param location string = resourceGroup().location
param swaResourceName string = 'litlabs-swa-prod'
param functionAppName string = 'litlabs-func-app-prod'
param frontDoorName string = 'litlabs-fd'
param wafPolicyName string = 'litlabs-waf-policy'

var tags = {
  environment: environment
  project: 'litlabs'
  managedBy: 'bicep'
}

// ============================================================================
// WAF POLICY (DRS 2.1, Bot Manager, Rate Limiting, JS Challenge, Geo Filtering)
// ============================================================================

resource wafPolicy 'Microsoft.Network/FrontDoorWebApplicationFirewallPolicies@2023-05-01' = {
  name: wafPolicyName
  location: 'global'
  tags: tags
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  properties: {
    policySettings: {
      enabledState: 'Enabled'
      mode: 'Prevention'
      redirectUrl: null
      customBlockResponseStatusCode: 403
      customBlockResponseBody: 'Access denied. Please try again later.'
      requestBodyCheck: 'Enabled'
      requestBodyInspectLimitInKB: 128
      fileUploadLimitInMb: 750
    }
    customRules: {
      rules: [
        {
          name: 'RateLimitRule'
          priority: 1
          enabledState: 'Enabled'
          ruleType: 'RateLimitRule'
          rateLimitDurationInMinutes: 1
          rateLimitThreshold: 2000
          matchConditions: [
            {
              matchVariable: 'SocketAddr'
              operator: 'Any'
              negateCondition: false
              matchValue: []
            }
          ]
          action: 'Block'
        }
        {
          name: 'GeoBlockingRule'
          priority: 2
          enabledState: 'Enabled'
          ruleType: 'MatchRule'
          matchConditions: [
            {
              matchVariable: 'RemoteAddr'
              operator: 'GeoMatch'
              negateCondition: true
              matchValue: [
                'US'
                'CA'
                'MX'
              ]
            }
          ]
          action: 'Block'
        }
        {
          name: 'JsChallengeRule'
          priority: 3
          enabledState: 'Enabled'
          ruleType: 'MatchRule'
          matchConditions: [
            {
              matchVariable: 'RequestUri'
              operator: 'Contains'
              negateCondition: false
              matchValue: [
                '/api'
              ]
            }
          ]
          action: 'Challenge'
        }
      ]
    }
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'DefaultRuleSet'
          ruleSetVersion: '2.1'
          ruleGroupOverrides: []
          exclusions: []
        }
        {
          ruleSetType: 'BotProtection'
          ruleSetVersion: '1.0'
          ruleGroupOverrides: []
          exclusions: []
        }
      ]
    }
  }
}

// ============================================================================
// FRONT DOOR (Premium Tier)
// ============================================================================

resource frontDoor 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: frontDoorName
  location: 'global'
  tags: tags
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  properties: {
    originResponseTimeoutSeconds: 60
  }
}

// Origin Group (Backend Pool)
resource originGroup 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = {
  name: 'backendPool'
  parent: frontDoor
  properties: {
    loadBalancingSettings: {
      additionalLatencyInMilliseconds: 50
      sampleSize: 4
      successfulSamplesRequired: 3
    }
    healthProbeSettings: {
      probePath: '/health'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 100
    }
    sessionAffinityState: 'Disabled'
  }
}

// SWA Origin
resource swaOrigin 'Microsoft.Cdn/profiles/origins@2023-05-01' = {
  name: '${swaResourceName}-origin'
  parent: frontDoor
  properties: {
    hostName: '${swaResourceName}.azurestaticapps.net'
    httpPort: 80
    httpsPort: 443
    originHostHeader: '${swaResourceName}.azurestaticapps.net'
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}

// Functions Origin
resource functionsOrigin 'Microsoft.Cdn/profiles/origins@2023-05-01' = {
  name: '${functionAppName}-origin'
  parent: frontDoor
  properties: {
    hostName: '${functionAppName}.azurewebsites.net'
    httpPort: 80
    httpsPort: 443
    originHostHeader: '${functionAppName}.azurewebsites.net'
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}

// Route for Web (SWA)
resource webRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = {
  name: 'webRoute'
  parent: endpoint
  dependsOn: [
    wafAssociation
  ]
  properties: {
    originGroup: {
      id: originGroup.id
    }
    origins: [
      {
        id: swaOrigin.id
      }
    ]
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/*'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
  }
}

// Route for API (Functions)
resource apiRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = {
  name: 'apiRoute'
  parent: endpoint
  dependsOn: [
    wafAssociation
  ]
  properties: {
    originGroup: {
      id: originGroup.id
    }
    origins: [
      {
        id: functionsOrigin.id
      }
    ]
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/api/*'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
  }
}

// Endpoint
resource endpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-05-01' = {
  name: '${frontDoorName}-endpoint'
  parent: frontDoor
  properties: {
    enabledState: 'Enabled'
  }
}

// WAF Association
resource wafAssociation 'Microsoft.Cdn/profiles/afdEndpoints/webApplicationFirewallPolicyLinks@2023-05-01' = {
  name: 'wafLink'
  parent: endpoint
  properties: {
    securityPolicyId: wafPolicy.id
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================

output frontDoorEndpoint string = endpoint.properties.hostName
output wafPolicyId string = wafPolicy.id
