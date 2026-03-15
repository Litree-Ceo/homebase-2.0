// monitoring.bicep - App Insights, Log Analytics, Workbooks & Alerts

@description('Location for resources')
param location string

@description('Log Analytics workspace name')
param workspaceName string

@description('Application Insights name')
param appInsightsName string

@description('Resource tags')
param tags object = {}

// ==============================================================================
// Log Analytics Workspace
// ==============================================================================
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: workspaceName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 7
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: 5
    }
  }
}

// ==============================================================================
// Application Insights
// ==============================================================================
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    RetentionInDays: 7
    SamplingPercentage: 100
  }
}

// ==============================================================================
// Action Group for Alerts
// ==============================================================================
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: '${appInsightsName}-alerts'
  location: 'global'
  tags: tags
  properties: {
    groupShortName: 'LitLabsAlert'
    enabled: true
    emailReceivers: [
      {
        name: 'AdminEmail'
        emailAddress: 'admin@litlabs.com'
        useCommonAlertSchema: true
      }
    ]
  }
}

// ==============================================================================
// Metric Alerts
// ==============================================================================
// High Error Rate Alert
resource errorRateAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${appInsightsName}-high-error-rate'
  location: 'global'
  tags: tags
  properties: {
    description: 'Alert when error rate exceeds 5%'
    severity: 2
    enabled: true
    scopes: [appInsights.id]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighErrorRate'
          metricName: 'requests/failed'
          metricNamespace: 'microsoft.insights/components'
          operator: 'GreaterThan'
          threshold: 5
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// High Response Time Alert
resource responseTimeAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${appInsightsName}-high-response-time'
  location: 'global'
  tags: tags
  properties: {
    description: 'Alert when average response time exceeds 3 seconds'
    severity: 3
    enabled: true
    scopes: [appInsights.id]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighResponseTime'
          metricName: 'requests/duration'
          metricNamespace: 'microsoft.insights/components'
          operator: 'GreaterThan'
          threshold: 3000
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// ==============================================================================
// Scheduled Query Rules (Log-based Alerts)
// ==============================================================================
resource exceptionAlert 'Microsoft.Insights/scheduledQueryRules@2023-03-15-preview' = {
  name: '${appInsightsName}-exceptions'
  location: location
  tags: tags
  properties: {
    displayName: 'High Exception Rate'
    description: 'Alert when exceptions exceed threshold'
    severity: 2
    enabled: true
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    scopes: [appInsights.id]
    criteria: {
      allOf: [
        {
          query: 'exceptions | summarize count() by bin(timestamp, 5m)'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 10
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [actionGroup.id]
    }
  }
}

// ==============================================================================
// Workbook for Dashboard
// ==============================================================================
resource workbook 'Microsoft.Insights/workbooks@2022-04-01' = {
  name: guid('${appInsightsName}-workbook')
  location: location
  tags: tags
  kind: 'shared'
  properties: {
    displayName: 'LITLABS Operations Dashboard'
    category: 'workbook'
    sourceId: appInsights.id
    serializedData: '''
{
  "version": "Notebook/1.0",
  "items": [
    {
      "type": 1,
      "content": {
        "json": "# LITLABS Operations Dashboard\nReal-time monitoring for API health and performance."
      },
      "name": "header"
    },
    {
      "type": 10,
      "content": {
        "chartId": "workbook-chart-requests",
        "version": "MetricsItem/2.0",
        "size": 0,
        "chartType": 2,
        "resourceType": "microsoft.insights/components",
        "metricScope": 0,
        "resourceIds": ["${appInsights.id}"],
        "timeContext": {"durationMs": 3600000},
        "metrics": [
          {"namespace": "microsoft.insights/components", "metric": "requests/count", "aggregation": 1}
        ],
        "title": "Request Volume"
      },
      "name": "requests-chart"
    },
    {
      "type": 10,
      "content": {
        "chartId": "workbook-chart-errors",
        "version": "MetricsItem/2.0",
        "size": 0,
        "chartType": 2,
        "resourceType": "microsoft.insights/components",
        "metricScope": 0,
        "resourceIds": ["${appInsights.id}"],
        "timeContext": {"durationMs": 3600000},
        "metrics": [
          {"namespace": "microsoft.insights/components", "metric": "requests/failed", "aggregation": 1}
        ],
        "title": "Failed Requests"
      },
      "name": "errors-chart"
    }
  ]
}
'''
  }
}

// ==============================================================================
// Outputs
// ==============================================================================
output logAnalyticsId string = logAnalytics.id
output logAnalyticsWorkspaceId string = logAnalytics.properties.customerId
output appInsightsId string = appInsights.id
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output actionGroupId string = actionGroup.id
