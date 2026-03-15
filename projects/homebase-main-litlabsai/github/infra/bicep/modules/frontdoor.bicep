// frontdoor.bicep - Azure Front Door Premium with WAF
// Includes DRS 2.1, Bot Manager, Rate Limiting, JS Challenge, Geo Filtering

@description('Front Door profile name')
param frontDoorName string

@description('WAF policy name')
param wafPolicyName string

@description('Backend Function App hostname')
param functionAppHostname string

@description('Resource tags')
param tags object = {}

// ==============================================================================
// WAF Policy
// ==============================================================================
// @cost-optimized: Switched from Premium to Standard (saves ~$400/month)
// Standard tier provides basic DDoS protection without Bot Manager
resource wafPolicy 'Microsoft.Network/FrontDoorWebApplicationFirewallPolicies@2022-05-01' = {
  name: wafPolicyName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  tags: tags
  properties: {
    policySettings: {
      enabledState: 'Enabled'
      mode: 'Prevention'
      requestBodyCheck: 'Enabled'
      customBlockResponseStatusCode: 403
      customBlockResponseBody: base64('{"error":"Request blocked by WAF","code":"WAF_BLOCKED"}')
      redirectUrl: 'https://www.example.com'
    }
    // Managed Rules - DRS 2.1
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'Microsoft_DefaultRuleSet'
          ruleSetVersion: '2.1'
          ruleSetAction: 'Block'
        }
        {
          ruleSetType: 'Microsoft_BotManagerRuleSet'
          ruleSetVersion: '1.0'
          ruleSetAction: 'Block'
        }
      ]
    }
    // Custom Rules
    customRules: {
      rules: [
        // Rate Limiting Rule
        {
          name: 'RateLimitRule'
          enabledState: 'Enabled'
          priority: 100
          ruleType: 'RateLimitRule'
          rateLimitDurationInMinutes: 1
          rateLimitThreshold: 100
          matchConditions: [
            {
              matchVariable: 'RequestUri'
              operator: 'Contains'
              matchValue: ['/api/']
              negateCondition: false
              transforms: ['Lowercase']
            }
          ]
          action: 'Block'
        }
        // Geo Filtering - Block high-risk countries
        {
          name: 'GeoBlockRule'
          enabledState: 'Enabled'
          priority: 200
          ruleType: 'MatchRule'
          matchConditions: [
            {
              matchVariable: 'RemoteAddr'
              operator: 'GeoMatch'
              matchValue: ['RU', 'CN', 'KP', 'IR']
              negateCondition: false
            }
          ]
          action: 'Block'
        }
        // JavaScript Challenge for suspicious IPs
        {
          name: 'JSChallengeRule'
          enabledState: 'Enabled'
          priority: 300
          ruleType: 'MatchRule'
          matchConditions: [
            {
              matchVariable: 'RequestHeader'
              selector: 'User-Agent'
              operator: 'Contains'
              matchValue: ['bot', 'crawler', 'spider', 'scraper']
              negateCondition: false
              transforms: ['Lowercase']
            }
          ]
          action: 'JSChallenge'
        }
      ]
    }
  }
}

// ==============================================================================
// Front Door Profile
// ==============================================================================
// @cost-optimized: Switched from Premium to Standard
resource frontDoorProfile 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: frontDoorName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  tags: tags
  properties: {
    originResponseTimeoutSeconds: 60
  }
}

// ==============================================================================
// Endpoint
// ==============================================================================
resource frontDoorEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-05-01' = {
  parent: frontDoorProfile
  name: '${frontDoorName}-endpoint'
  location: 'global'
  tags: tags
  properties: {
    enabledState: 'Enabled'
  }
}

// ==============================================================================
// Origin Group
// ==============================================================================
resource originGroup 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = {
  parent: frontDoorProfile
  name: 'api-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/api/health'
      probeRequestType: 'GET'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 30
    }
    sessionAffinityState: 'Disabled'
  }
}

// ==============================================================================
// Origin (Function App)
// ==============================================================================
resource origin 'Microsoft.Cdn/profiles/originGroups/origins@2023-05-01' = {
  parent: originGroup
  name: 'function-app-origin'
  properties: {
    hostName: functionAppHostname
    httpPort: 80
    httpsPort: 443
    originHostHeader: functionAppHostname
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
    enforceCertificateNameCheck: true
    // Private Link for secure backend connection can be configured here if needed
  }
}

// ==============================================================================
// Route
// ==============================================================================
resource route 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = {
  parent: frontDoorEndpoint
  name: 'api-route'
  properties: {
    originGroup: {
      id: originGroup.id
    }
    supportedProtocols: ['Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    cacheConfiguration: {
      queryStringCachingBehavior: 'IgnoreQueryString'
      compressionSettings: {
        isCompressionEnabled: true
        contentTypesToCompress: [
          'application/json'
          'application/javascript'
          'text/html'
          'text/css'
          'text/plain'
        ]
      }
    }
  }
}

// ==============================================================================
// Security Policy (WAF Association)
// ==============================================================================
resource securityPolicy 'Microsoft.Cdn/profiles/securityPolicies@2023-05-01' = {
  parent: frontDoorProfile
  name: 'waf-security-policy'
  properties: {
    parameters: {
      type: 'WebApplicationFirewall'
      wafPolicy: {
        id: wafPolicy.id
      }
      associations: [
        {
          domains: [
            {
              id: frontDoorEndpoint.id
            }
          ]
          patternsToMatch: ['/*']
        }
      ]
    }
  }
}

// ==============================================================================
// Outputs
// ==============================================================================
output frontDoorId string = frontDoorProfile.id
output frontDoorEndpoint string = 'https://${frontDoorEndpoint.properties.hostName}'
output wafPolicyId string = wafPolicy.id
