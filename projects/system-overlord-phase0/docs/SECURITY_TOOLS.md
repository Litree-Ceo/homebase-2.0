# System Overlord: Security Tools Integration Guide (Phase 0)

## Executive Overview

This guide details the implementation of offensive security tools (Kali Linux) integration across the System Overlord platform, following the **hybrid approach**: curated tools on Termux/PC agents, with optional remote Kali container for advanced operations.

**Key Principles:**
- ✅ Zero-budget MVP (tools only, no hosting paid)
- ✅ Real-time observability (Firebase audit logs)
- ✅ Hardware-backed authorization (biometric for sensitive ops)
- ✅ Progressive complexity (LOW risk → MEDIUM → HIGH)

---

## Phase 0 Architecture: "Now" ($0)

### 1. Tool Deployment Matrix

| Tool | Termux | PC (Docker) | Remote Kali | Risk | Approval |
|------|--------|-----------|-------------|------|----------|
| **nmap** | ✅ | ✅ | ✅ | LOW | No |
| **httpx** | ✅ | ✅ | ✅ | LOW | No |
| **nikto** | ❌ | ✅ | ✅ | MEDIUM | Yes |
| **sqlmap** | ❌ | ✅ | ✅ | HIGH | Yes |
| **hydra** | ✅ | ✅ | ✅ | HIGH | Yes |
| **hashcat** | ❌ | ✅ | ✅ | HIGH | Yes |
| **metasploit** | ❌ | ❌ | ✅ | CRITICAL | Yes |

### 2. Command Execution Flow

```
User (Next.js Dashboard)
    ↓
Firebase Cloud Function: queueCommand()
    ├─ Validate tool exists & user authorized
    ├─ Validate parameters against schema
    └─ Create pending command document
        ↓
Agent (PC/Termux/Kali) polls Firestore
    ├─ Find pending command for their platform
    ├─ Execute tool with parameters
    └─ Update command status (completed/failed)
        ↓
Dashboard: Real-time status via Firestore listener
    └─ Display output, errors, performance metrics
```

---

## Part 1: Phase 0 Immediate Deployment (Week 1)

### Step 1: Deploy Tool Catalog to Firestore

The `firestore.tools-schema.json` defines all available tools, parameter schemas, risk levels, and constraints.

```bash
# Upload tool catalog to Firestore
firebase firestore:bulk-import firestore.tools-schema.json

# Or upload via Firebase Console:
# Firestore → Collection "config" → Document "toolCatalog" → paste JSON
```

**Verify:**
```bash
firebase firestore:get config/toolCatalog
```

### Step 2: Deploy Cloud Functions

The extended `functions/src/index.ts` now includes:
- `queueCommand()` - Submit tool execution request
- `getCommandStatus()` - Check command status
- `validateCommand()` - Parameter validation logic

```bash
cd functions
npm install  # Already done in Phase 0
firebase deploy --only functions

# Verify functions deployed:
firebase functions:list
```

**Test command submission:**
```bash
curl -X POST https://overlord-command-center.cloudfunctions.net/api/queueCommand \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "nmap-scan",
    "parameters": {"target": "example.com", "ports": "80,443", "scanType": "-sS"},
    "targetAgent": "pc-docker"
  }'
```

### Step 3: Deploy PC Agent Framework

This runs on your Windows/Linux PC and polls for commands.

**Windows (PowerShell):**
```powershell
# Navigate to project
cd C:\Users\litre\Desktop\System-Overlord-Phase0

# Install Python dependencies
pip install -r agents\pc_agent_requirements.txt

# Create firebase-key.json (download from Firebase Console)
# Place in System-Overlord-Phase0 root directory

# Start agent
$env:AGENT_ID = "pc-office"
$env:AGENT_PLATFORM = "pc-docker"
$env:GOOGLE_APPLICATION_CREDENTIALS = "./firebase-key.json"
python agents/pc_agent.py
```

**Linux (Bash):**
```bash
cd ~/System-Overlord-Phase0

# Install Docker (if not present)
# Follow https://docs.docker.com/engine/install/

# Install Python dependencies
pip install -r agents/pc_agent_requirements.txt

# Create firebase-key.json
# Download from Firebase Console → Settings → Service Accounts

# Start agent
export AGENT_ID="pc-linux"
export AGENT_PLATFORM="pc-docker"
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-key.json"
python3 agents/pc_agent.py
```

**Agent startup output should show:**
```
2025-03-01 12:34:56 - PCAgent - INFO - Firebase initialized successfully
2025-03-01 12:34:57 - PCAgent - INFO - Docker client initialized
2025-03-01 12:34:58 - PCAgent - INFO - Agent registered: pc-office
2025-03-01 12:34:59 - PCAgent - INFO - PC Agent starting (platform: pc-docker)
```

### Step 4: Deploy Termux Agent

On your Android device with Termux:

```bash
# SSH to Termux from PC, or direct on device terminal
# Download setup script
curl https://raw.githubusercontent.com/yourusername/System-Overlord-Phase0/main/setup-termux-agent.sh -o setup-termux.sh

chmod +x setup-termux.sh
./setup-termux.sh

# After setup completes, create firebase-key.json
# Option 1: Copy via ADB
adb push firebase-key.json /data/data/com.termux/files/home/

# Option 2: Paste via terminal
# cat > ~/firebase-key.json << 'EOF'
# [paste JSON from Firebase Console]
# EOF

# Start agent
export GOOGLE_APPLICATION_CREDENTIALS=~/firebase-key.json
python3 ~/System-Overlord-Phase0/agents/termux_agent.py
```

### Step 5: Verify Agents in Dashboard

```bash
# Deploy Next.js dashboard
cd web
npm run build
firebase deploy --only hosting

# Visit https://your-project-id.web.app/agents
# Should show:
# - pc-office (online, platform: pc-docker, capabilities: [nmap-scan, httpx-probe, nikto-scan, sqlmap-injection])
# - termux-xxxx (online, platform: termux, capabilities: [nmap-scan, httpx-probe, whois-lookup])
```

---

## Part 2: Security Operations (Phase 0)

### Scenario 1: Basic Port Scanning

**User Action (Dashboard):**
1. Navigate to "Security Workbench"
2. Select "nmap"
3. Enter target: `example.com`
4. Enter ports: `80,443`
5. Select execution platform: `PC (Docker)`
6. Click "Execute"

**Backend Flow:**
1. Cloud Function validates parameters (target is valid hostname, ports in range)
2. Creates Firestore document: `security_commands/{commandId}`
3. PC Agent polls, finds pending command matching `pc-docker` platform
4. Agent executes: `docker run insready/nmap nmap -sS example.com -p 80,443`
5. Captures output, writes to Firestore result field
6. Dashboard listener updates with live results

**Output Example:**
```
PORT    STATE SERVICE
80/tcp  open  http
443/tcp open  https
```

### Scenario 2: Web Server Scanning (Medium Risk - Approval Required)

**Execution Flow with Approval:**

```bash
# 1. User submits nikto scan
[Dashboard] → queueCommand("nikto-scan", {target: "example.com"})

# 2. Cloud Function detects HIGH risk, requires biometric approval
# Biometric prompt appears on user's authenticated device
[Biometric Prompt] "Approve high-risk security operation?"

# 3. User approves with fingerprint
# Biometric attestation token is embedded in command

# 4. Agent executes with full audit trail
nikto -h example.com
# Output written to Firestore with execution context

# 5. Audit log records:
# - User ID
# - Biometric verification timestamp
# - Full command parameters
# - Execution result hash
# - All output snippet excerpts
```

### Scenario 3: Distributed Execution

**Termux + PC Coordinated Scan:**

```bash
# User wants full reconnaissance
# 1. Quick reconnaissance from mobile (low latency)
[Termux] nmap -sS example.com -p 1-10000

# 2. Deep Web analysis from desktop in parallel
[PC Docker] nikto -h http://example.com

# Both execute simultaneously through Firebase coordination
# Results aggregate in real-time dashboard
```

---

## Part 3: Audit & Compliance

### Firestore Collections Structure

```firestore
security_commands/
├── {commandId}
│   ├── userId: "auth123"
│   ├── toolId: "nmap-scan"
│   ├── status: "completed"
│   ├── parameters: {...}
│   ├── result: {...}
│   ├── auditLog: [
│   │   {
│   │     timestamp: ISO,
│   │     event: "command_queued",
│   │     userId: "auth123"
│   │   },
│   │   {
│   │     timestamp: ISO,
│   │     event: "command_executing",
│   │     agentId: "pc-office"
│   │   },
│   │   {
│   │     timestamp: ISO,
│   │     event: "command_completed",
│   │     resultHash: "sha256..."
│   │   }
│   │ ]
│   └── resultHash: "sha256abc123"

audit_log/
├── {auditId}
│   ├── userId: "auth123"
│   ├── action: "security_command_queued"
│   ├── toolId: "nmap-scan"
│   ├── timestamp: ISO
│   ├── commandId: "cmdId"
│   └── ipAddress: "203.0.113.42"
```

### Querying Audit Trail

```javascript
// Get all scans targeting a specific domain
const scans = await db
  .collection('security_commands')
  .where('toolId', '==', 'nmap-scan')
  .where('parameters.target', '==', 'example.com')
  .orderBy('createdAt', 'desc')
  .get();

// Get all high-risk operations by user
const highRiskOps = await db
  .collection('security_commands')
  .where('userId', '==', userId)
  .where('riskLevel', '==', 'HIGH')
  .orderBy('createdAt', 'desc')
  .get();

// Check for suspicious patterns
const frequentTargets = await db
  .collection('audit_log')
  .where('userId', '==', userId)
  .where('action', '==', 'security_command_queued')
  .orderBy('timestamp', 'desc')
  .limit(100)
  .get();
```

---

## Part 4: Phase 1 Path (Week 2-3) - Advanced Features

### Remote Kali Container Deployment

When PC/Termux tools are insufficient:

**Option A: Railway (Recommended for Phase 1)**

```yaml
# railway.yml
services:
  kali:
    image: kalilinux/kali-rolling:latest
    environment:
      - AGENT_ID=kali-remote-1
      - GOOGLE_APPLICATION_CREDENTIALS=/app/firebase-key.json
    volumes:
      - /app/logs:/var/log/kali
    command: >
      bash -c '
      apt-get update &&
      apt-get install -y python3 python3-pip &&
      pip install firebase-admin requests &&
      python3 /app/kali_agent.py
      '
```

Deploy: `railway up`

**Option B: Docker Cloud Run**

```bash
# Build custom Kali agent image
docker build -t gcr.io/overlord-project/kali-agent .
docker push gcr.io/overlord-project/kali-agent

# Deploy with Cloud Run (free tier: 2M requests/month)
gcloud run deploy kali-agent \
  --image gcr.io/overlord-project/kali-agent \
  --memory 2Gi \
  --timeout 900 \
  --set-env-vars="AGENT_PLATFORM=kali-remote"
```

### Performance Optimization

**Command Result Storage:**
- Small results (<1MB) → Firestore document
- Large results (>1MB) → Cloud Storage with signed URL
- Terminal recordings → Cloud Storage with retention policy (30 days)

```typescript
// Cloud Function: optimized result storage
async function storeCommandResult(commandId: string, result: any) {
  const resultSize = JSON.stringify(result).length;

  if (resultSize < 1000000) { // 1MB
    // Store in Firestore
    await db.collection('security_commands').doc(commandId).update({
      result: result
    });
  } else {
    // Store in Cloud Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(`command-results/${commandId}.json`);
    await file.save(JSON.stringify(result));

    // Store signed URL in Firestore
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await db.collection('security_commands').doc(commandId).update({
      resultUrl: signedUrl,
      resultStoredIn: 'cloud-storage'
    });
  }
}
```

---

## Part 5: Security Best Practices

### 1. Credential Management

```bash
# PC Agent: Store credentials ONLY in environment variables
# Never in source code or config files

# Termux: Use Android Keystore via termux-api
export REAL_DEBRID_TOKEN=$(termux-keystore get REAL_DEBRID_TOKEN)

# Firebase: Use custom tokens with expiration
function createAgentToken(agentId: string) {
  const customClaims = {
    agent: true,
    agentId: agentId,
    allowedTools: ['nmap-scan', 'httpx-probe'],
    riskLevel: 'MEDIUM'
  };

  return await admin.auth().createCustomToken(agentId, customClaims);
}
```

### 2. Network Safety

```python
# PC Agent: Validate all targets
BLOCKED_RANGES = [
  '10.0.0.0/8',         # Private
  '172.16.0.0/12',      # Private
  '192.168.0.0/16',     # Private
  '127.0.0.1',          # Localhost
  '169.254.0.0/16',     # Link-local
]

def is_safe_target(target):
  ip = re.sub(r'/\d+$', '', target)  # Remove CIDR
  for blocked_range in BLOCKED_RANGES:
    if ip_in_network(ip, blocked_range):
      return False
  return True
```

### 3. Rate Limiting

```typescript
// Cloud Function: Enforce per-user limits
const limiter = new Map<string, number[]>();

function checkRateLimit(userId: string, toolId: string): boolean {
  const key = `${userId}:${toolId}`;
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  if (!limiter.has(key)) {
    limiter.set(key, []);
  }

  const timestamps = limiter.get(key)!.filter(ts => ts > oneHourAgo);

  if (timestamps.length >= 5) { // 5 per hour
    return false;
  }

  timestamps.push(now);
  limiter.set(key, timestamps);
  return true;
}
```

---

## Troubleshooting

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Agent offline | `Firebase Console → Agents → lastHeartbeat` | Restart agent, check logs |
| Command timeout | Check execution time vs tool timeout | Increase timeout in schema, optimize parameters |
| Docker not available | `docker ps` returns error | Install Docker Desktop, enable in WSL2 |
| Termux tools missing | `which nmap` returns empty | Run `setup-termux-agent.sh` again, `pkg search nmap` |
| Permission denied | Check Firebase rules, custom claims | Verify user role, regenerate auth token |
| Results not appearing | Check `result` field in Firestore | Check agent logs: `tail pc_agent.log` |

---

## Success Metrics

✅ Day 1:
- [ ] Tools catalog deployed to Firestore
- [ ] Cloud Functions operational
- [ ] PC Agent running and registered
- [ ] Termux Agent running on Android device
- [ ] Successful nmap scan from both platforms visible in dashboard

✅ Week 1:
- [ ] Authorization flows (admin approval for MEDIUM/HIGH risk)
- [ ] Complete audit trail in Firestore
- [ ] Output storage (small/large result handling)
- [ ] Rate limiting enforced

✅ Week 2-3:
- [ ] Remote Kali container deployed (optional)
- [ ] Multi-agent coordination workflows
- [ ] Performance metrics & optimization
- [ ] Team onboarding documentation

---

## Additional Resources

- [Kali Linux Tools Guide](https://www.kalilinux.org/tools-listing)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [nmap Usage Guide](https://nmap.org/book/man.html)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

**Last Updated:** March 1, 2025  
**Next Review:** Phase 1 completion (Week 3)
