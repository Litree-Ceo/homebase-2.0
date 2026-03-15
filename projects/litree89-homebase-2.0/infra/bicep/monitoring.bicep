param appInsightsName string = 'litlabs-appinsights'
param actionGroupName string = 'litlabs-alerts'
param emailReceivers array = []

resource appInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: appInsightsName
}

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: actionGroupName
  location: 'global'
  properties: {
    groupShortName: 'Alerts'
    enabled: true
    emailReceivers: emailReceivers
  }
}

output appInsightsId string = appInsights.id
output actionGroupId string = actionGroup.id
