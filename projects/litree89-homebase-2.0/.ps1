<#
.SYNOPSIS
  LiTreeLab Homebase Master Bootstrap (safe, idempotent, Copilot-ready)

.EXAMPLE
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\litree-homebase-master-bootstrap.ps1 -SubscriptionId '0f95fc53-...' -GitHubUser 'LiTree89' -RepoName 'litlab-homebase' -Location 'eastus2' -Visibility 'private'

.PARAMETER Visibility
  "private" (default) or "public" - *private is recommended.*

.PARAMETER WhatIfMode
  Switch to preview actions only (no changes made).
#>

param(
  [Parameter(Mandatory=$true)][string]$SubscriptionId,
  [Parameter(Mandatory=$true)][string]$GitHubUser,
  [Parameter(Mandatory=$true)][string]$RepoName,
  [ValidateSet("eastus","eastus2","centralus","westeurope","uksouth","eastasia")][string]$Location = "eastus2",
  [ValidateSet("private","public")][string]$Visibility = "private",
  [string]$ResourceGroup = "litree-prod-rg",
  [string]$WebAppName = "",                # defaults to derived name
  [string]$FunctionsName = "",             # defaults to derived name
  [switch]$WhatIfMode
)

$ErrorActionPreference = "Stop"

function Log($msg, $color='White') { Write-Host $msg -ForegroundColor $color }
function Assert-CommandAvailable($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Required command '$name' not found. Install: $hint"
  }
} 

# Dry-run helper
function Invoke-Action([ScriptBlock]$action, [string]$description) {
  if ($WhatIfMode) {
    Log "WHATIF: $description" Yellow
    return
  }
  & $action
} 

# Validate CLI tools
Log "🔎 Validating required CLIs..." Cyan
Assert-CommandAvailable git "winget install --id Git.Git"
Assert-CommandAvailable gh "winget install --id GitHub.cli"
Assert-CommandAvailable az "winget install --id Microsoft.AzureCLI"
Assert-CommandAvailable code "Install VS Code from https://code.visualstudio.com/"
Assert-CommandAvailable node "winget install --id OpenJS.NodeJS.LTS"

# Confirm GitHub auth
try {
  gh auth status 2>$null | Out-Null
} catch {
  throw "GitHub CLI not authenticated. Run: gh auth login"
}

# Confirm Azure auth
try {
  az account show 2>$null | Out-Null
} catch {
  throw "Azure CLI not authenticated. Run: az login"
}

# Derived names & uniqueness
if (-not $WebAppName) { $WebAppName = "$RepoName-web" }
if (-not $FunctionsName) { $FunctionsName = "$RepoName-func" }

Log "`n🏗️  Starting bootstrap for '$RepoName' (visibility=$Visibility) in subscription $SubscriptionId..." Green

# Resource group
$rgExists = (az group exists --name $ResourceGroup | ConvertFrom-Json)
if (-not $rgExists) {
  Invoke-Action { az group create --name $ResourceGroup --location $Location | Out-Null } "Create Resource Group $ResourceGroup"
  Log "Created resource group: $ResourceGroup" Green
} else {
  Log "Resource group '$ResourceGroup' already exists (idempotent)" DarkGreen
} 

# Cosmos DB
$cosmosName = "${RepoName}cosmos"
$cosmosExists = (az cosmosdb show --name $cosmosName --resource-group $ResourceGroup --query "name" -o tsv 2>$null) -ne $null
if (-not $cosmosExists) {
  Invoke-Action { az cosmosdb create --name $cosmosName --resource-group $ResourceGroup --locations regionName=$Location failoverPriority=0 --default-consistency-level Session | Out-Null } "Create Cosmos DB $cosmosName"
  Log "Created Cosmos DB: $cosmosName" Green
} else {
  Log "Cosmos DB '$cosmosName' exists (idempotent)" DarkGreen
}

# Cosmos DB database + container
Invoke-Action { az cosmosdb sql database create --account-name $cosmosName --resource-group $ResourceGroup --name litlabdb | Out-Null } "Create Cosmos DB database 'litlabdb' (idempotent)"
Invoke-Action { az cosmosdb sql container create --account-name $cosmosName --resource-group $ResourceGroup --database-name litlabdb --name users --partition-key-path '/id' | Out-Null } "Create container 'users'"

# SignalR
$signalrName = "${RepoName}-signalr"
$signalrExists = (az signalr show --name $signalrName --resource-group $ResourceGroup --query "name" -o tsv 2>$null) -ne $null
if (-not $signalrExists) {
  Invoke-Action { az signalr create --name $signalrName --resource-group $ResourceGroup --location $Location --sku Free_F1 | Out-Null } "Create SignalR $signalrName"
  Log "SignalR created: $signalrName" Green
} else {
  Log "SignalR '$signalrName' exists (idempotent)" DarkGreen
}

# Storage for Functions
$storageName = ($RepoName + (Get-Random -Minimum 1000 -Maximum 9999)).ToLower()
$storageExists = (az storage account show --name $storageName --resource-group $ResourceGroup -o tsv 2>$null) -ne $null
if (-not $storageExists) {
  Do-Action { az storage account create --name $storageName --resource-group $ResourceGroup --location $Location --sku Standard_LRS | Out-Null } "Create Storage account $storageName"
  Log "Storage created: $storageName" Green
} else {
  Log "Storage '$storageName' exists (idempotent)" DarkGreen
}

# Functions App
$funcExists = (az functionapp show --name $FunctionsName --resource-group $ResourceGroup -o tsv 2>$null) -ne $null
if (-not $funcExists) {
  Do-Action { az functionapp create --name $FunctionsName --resource-group $ResourceGroup --storage-account $storageName --runtime node --functions-version 4 --os-type Linux | Out-Null } "Create Functions app $FunctionsName"
  Log "Function App created: $FunctionsName" Green
} else {
  Log "Functions app '$FunctionsName' exists (idempotent)" DarkGreen
}

# Key Vault
$keyVaultName = ($RepoName + "-kv")
$kvExists = (az keyvault show --name $keyVaultName --resource-group $ResourceGroup -o tsv 2>$null) -ne $null
if (-not $kvExists) {
  Invoke-Action { az keyvault create --name $keyVaultName --resource-group $ResourceGroup --location $Location | Out-Null } "Create Key Vault $keyVaultName"
  Log "Key Vault created: $keyVaultName" Green
} else {
  Log "Key Vault '$keyVaultName' exists (idempotent)" DarkGreen
}

# Add placeholder secrets (no real secrets here)
Invoke-Action { az keyvault secret set --vault-name $keyVaultName --name "COSMOS_ENDPOINT" --value "REPLACE_WITH_COSMOS_ENDPOINT" | Out-Null } "Set placeholder secret COSMOS_ENDPOINT"
Invoke-Action { az keyvault secret set --vault-name $keyVaultName --name "SIGNALR_CONN" --value "REPLACE_WITH_SIGNALR_CONNSTRING" | Out-Null } "Set placeholder secret SIGNALR_CONN"
Invoke-Action { az keyvault secret set --vault-name $keyVaultName --name "GROK_API_KEY" --value "REPLACE_WITH_GROK_KEY" | Out-Null } "Set placeholder secret GROK_API_KEY"

# GitHub repo create (respect visibility)
$repoFull = "$GitHubUser/$RepoName"
$repoExists = $false
try { gh repo view $repoFull -q . 2>$null; $repoExists = $true } catch { $repoExists = $false }

if (-not $repoExists) {
  $createCmd = { gh repo create $repoFull --"$Visibility" --confirm }
  Invoke-Action $createCmd "Create GitHub repo $repoFull ($Visibility)"
  Log "GitHub repo created: $repoFull" Green
} else {
  Log "GitHub repo '$repoFull' already exists (idempotent)" DarkGreen
}

# Clone or reuse local folder
$localPath = Join-Path (Get-Location) $RepoName
if (-not (Test-Path -Path $localPath)) {
  Invoke-Action { git clone "https://github.com/$repoFull.git" } "Clone repo $repoFull"
  Set-Location $localPath
} else {
  Log "Local folder '$localPath' exists - using it (idempotent)" DarkGreen
  Set-Location $localPath
}

# Monorepo structure (idempotent)
$dirs = @("apps/desktop","apps/web","apps/mobile","packages/core","packages/api","ai-models","docs","scripts")
foreach ($d in $dirs) { if (-not (Test-Path $d)) { Do-Action { New-Item -ItemType Directory -Path $d -Force | Out-Null } "Create folder $d" } }

# Minimal backend package
$apiPath = "packages/api"
if (-not (Test-Path (Join-Path $apiPath "package.json"))) {
  New-Item -ItemType File -Path (Join-Path $apiPath "server.js") -Force -Value @"
const express = require('express');
const app = express();
app.use(express.json());
app.get('/hero', (req, res) => res.json({ ui: 'Neon Tree Hero', tiers: ['Free', 'Pro'] }));
app.listen(3000, () => console.log('Backend Ready - Expand with Copilot: // @workspace Add affiliate endpoints'));
"@ | Out-Null

  Do-Action { Push-Location $apiPath; npm init -y | Out-Null; npm install express | Out-Null; Pop-Location } "Init API package (npm install)"
  Log "Created minimal backend in $apiPath" Green
} else {
  Log "API package exists — skipping npm init" DarkGreen
}

# Web stub using Next.js (recommended) — leave scaffolding step for user to run locally
$webReadme = @"
# Web module (Next.js recommended)
Run locally:
cd apps/web
npx create-next-app@latest . --ts --eslint --app --src-dir --import-alias '@/*' --turbopack
npm install @microsoft/signalr @azure/cosmos @azure/msal-react @mui/material @emotion/react @emotion/styled
"@
Do-Action { $webReadme | Out-File -FilePath "apps/web/README.md" -Encoding utf8 } "Add Web README"

# Mobile note (React Native)
$mobileNote = @"
# Mobile module (React Native)
On Windows ensure Android SDK + JDK are installed. Create a new RN app:
npx react-native init LitLabMobile
(We avoid init '.' to keep this repo tidy.)
"@
Do-Action { $mobileNote | Out-File -FilePath "apps/mobile/README.md" -Encoding utf8 } "Add Mobile README"

# Functions skeleton
if (-not (Test-Path "functions")) { New-Item -ItemType Directory -Path "functions" | Out-Null }
$funcIndex = @"
module.exports = async function (context, documents) {
  if (documents && documents.length > 0) {
    context.log('Cosmos docs changed. Broadcasting...');
    context.bindings.signalRMessages = documents.map(doc => ({
      target: 'userSync',
      arguments: [doc]
    }));
  }
};
"@
Do-Action { $funcIndex | Out-File -FilePath "functions/index.js" -Encoding utf8 } "Write Functions skeleton"

$funcBinding = @"
{
  ""bindings"": [
    {
      ""type"": ""cosmosDBTrigger"",
      ""name"": ""documents"",
      ""direction"": ""in"",
      ""leaseCollectionName"": ""leases"",
      ""connectionStringSetting"": ""CosmosDBConnection"",
      ""createLeaseCollectionIfNotExists"": true,
      ""databaseName"": ""litlabdb"",
      ""collectionName"": ""users""
    },
    {
      ""type"": ""signalR"",
      ""name"": ""signalRMessages"",
      ""hubName"": ""lithub"",
      ""direction"": ""out"",
      ""connectionStringSetting"": ""SignalRConnection""
    }
  ]
}
"@
Do-Action { $funcBinding | Out-File -FilePath "functions/function.json" -Encoding utf8 } "Write Functions binding"

# Write README and Copilot instructions to repo root (idempotent update)
$readmeText = @"
# $RepoName — LiTreeLab Homebase (Bootstrap)

## What this does
- Creates Azure resources: Cosmos DB (litlabdb/users), SignalR ($signalrName), Function App ($FunctionsName), Storage ($storageName), Key Vault ($keyVaultName)
- Adds monorepo skeleton for Web (Next.js), Mobile (React Native), Backend (Node/Express), Functions

## Next steps (manual)
1. Add secure secrets in Key Vault (COSMOS_ENDPOINT, COSMOS_KEY, SIGNALR_CONN, GROK_API_KEY)
2. Scaffold web locally: cd apps/web; npx create-next-app...
3. Deploy functions: use VS Code Azure Functions ext or 'func azure functionapp publish $FunctionsName'
4. Use Copilot: highlight `// @workspace` markers to auto-expand features.

**Important**: Do NOT commit secrets. Use Key Vault + GitHub secrets.
"@
Do-Action { $readmeText | Out-File -FilePath "README.md" -Encoding utf8 } "Write README.md"

$copilotTxt = @"
# Copilot Instructions
- Use // @workspace for structural scaffolding.
- Use // @debugger for tests/fixes.
- Tiered bots: Free (rule-based), Pro (NLP), Enterprise (agentic multi-bot).
"@
Do-Action { $copilotTxt | Out-File -FilePath ".github/copilot-instructions.md" -Encoding utf8 } "Write Copilot instructions"

# Git commit + push
Do-Action { git add .; git commit -m "chore: bootstrap litree-homebase skeleton and Azure placeholders" } "Git commit changes"
try {
  Do-Action { git push origin main } "Push to GitHub"
  Log "Pushed code to GitHub ($repoFull)" Green
} catch {
  Log "Warning: git push failed (check remote or auth) — you may need to push manually." Yellow
}

Log "`n🎉 Bootstrap complete (or previewed in WhatIf mode). Next steps:" Cyan
Log "1) Add real keys to Key Vault: az keyvault secret set --vault-name $keyVaultName --name COSMOS_KEY --value '<value>'" White
Log "2) Scaffold web: cd apps/web; npx create-next-app@latest ..." White
Log "3) Deploy Functions via VS Code/Azure CLI" White
Log "4) Fill Copilot prompts: highlight // @workspace markers and accept suggestions" White

if ($WhatIfMode) {
  Log "`nNote: You ran in WHATIF mode — no resources were changed." Yellow
}