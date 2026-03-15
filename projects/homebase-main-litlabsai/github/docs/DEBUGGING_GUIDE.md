# 🐛 Debugging Guide - HomeBase 2.0

## Quick Start: Debug Your Running App

Your Next.js dev server is **already running** with debugging enabled!

### 1️⃣ Attach the Debugger (Right Now!)

1. **Press F5** or click the **Run & Debug** icon (left sidebar)
2. Select **"🥷 Attach to Next.js (Console Ninja)"**
3. Debugger connects to `ws://127.0.0.1:9229` ✅

### 2️⃣ Set Breakpoints

- Click in the gutter (left of line numbers) to add breakpoints
- Refresh <http://localhost:3000> to hit your breakpoints
- Inspect variables, step through code, etc.

---

## 🎯 Available Debug Configurations

### Console Ninja + Traditional Debugging

#### 🥷 Attach to Next.js (Console Ninja)

**Best for:** Quick debugging while Console Ninja is active

- Attaches to your running dev server on port 9229
- Works alongside Console Ninja inline logs
- Auto-restarts when you make changes

**Usage:**

```bash
# Server already running? Just press F5!
# Or manually: pnpm -C apps/web dev
# Then: F5 → "🥷 Attach to Next.js"
```

#### ⚡ Attach to Azure Functions

**Best for:** Debugging serverless functions

- Attaches to Azure Functions Core Tools
- Debugs TypeScript Azure Functions in `api/`

**Usage:**

```bash
pnpm -C api start
# Then: F5 → "⚡ Attach to Azure Functions"
```

### Browser Debugging

#### 🌐 Chrome: Debug Frontend

**Best for:** Full browser + code debugging

- Launches Chrome with debugger attached
- Debug React components, network requests, etc.
- Set breakpoints in both browser and VS Code

#### 🌐 Edge: Debug Frontend

**Best for:** Microsoft Edge users

- Same as Chrome but uses Edge browser

### Compound Configurations

#### 🚀 LITLABS: Full Stack Debug

**Debug everything at once:**

- Azure Functions backend
- Next.js frontend in Chrome
- Perfect for API + UI debugging

#### 🥷 Console Ninja + Debugger

**Best of both worlds:**

- Inline Console Ninja logs
- Traditional breakpoint debugging
- Recommended for daily development

---

## 🔍 Debugging Workflows

### Scenario 1: "I just want to see console.log inline"

✅ **Use Console Ninja** (already active!)

- Just add `console.log()` and see output in editor
- No debugger needed

### Scenario 2: "I need to pause execution and inspect variables"

✅ **Use:** 🥷 Attach to Next.js (Console Ninja)

1. Set breakpoint (click gutter)
2. F5 → Select "🥷 Attach to Next.js"
3. Trigger code path (refresh page, click button)
4. Execution pauses at breakpoint

### Scenario 3: "I'm debugging API + Frontend together"

✅ **Use:** 🚀 LITLABS: Full Stack Debug

1. Start API: `pnpm -C api start`
2. F5 → Select "🚀 LITLABS: Full Stack Debug"
3. Set breakpoints in both frontend and backend
4. Debug full request/response cycle

### Scenario 4: "I need browser DevTools + VS Code debugging"

✅ **Use:** 🌐 Chrome: Debug Frontend

1. F5 → Select "🌐 Chrome: Debug Frontend"
2. Chrome opens with DevTools available
3. Set breakpoints in VS Code
4. Use both Chrome DevTools AND VS Code debugger

---

## ⚡ Pro Tips

### Console Ninja + Debugger = Perfect Combo

- **Console Ninja**: Quick iteration, inline values
- **Debugger**: Deep inspection, step-through
- **Use both**: Console.log for overview, breakpoints for details

### Debug Server-Side Next.js

Next.js runs code both client and server. To debug server-side:

```typescript
// This runs on the server
export async function getServerSideProps(context) {
  console.log('Server-side!'); // Console Ninja shows this
  debugger; // Breakpoint works here too!
  return { props: {} };
}
```

### Network Debugging

Console Ninja automatically captures:

- `fetch()` requests
- `XMLHttpRequest` calls
- Shows URL, method, status, payloads

Add breakpoints to see full request/response:

```typescript
const response = await fetch('/api/data'); // Breakpoint here
const data = await response.json(); // Or here
```

### TypeScript Source Maps

✅ Already configured! Debug TypeScript directly:

- Set breakpoints in `.ts`/`.tsx` files
- No need to map to compiled `.js`

### Hot Reload + Debugging

Debugger auto-reconnects when you save files:

1. Set breakpoint
2. Edit code
3. Save (hot reload)
4. Debugger reattaches automatically ✨

---

## 🔧 Troubleshooting

### "Cannot connect to runtime process"

**Fix:** Dev server not running or port mismatch

```bash
# Start dev server first
pnpm -C apps/web dev

# Then attach debugger (F5)
```

### "Breakpoint not hit"

**Check:**

1. Is code path executing? (Add `console.log` first)
2. Source maps enabled? (Already configured ✅)
3. Try restarting dev server and debugger

### "Debugger keeps disconnecting"

**Fix:** Use `restart: true` config (already set ✅)

- Debugger auto-reconnects on file changes
- If still issues, restart both server and debugger

### "Can't debug server-side code"

**Fix:** Make sure you're using server-side entry points:

- `getServerSideProps`
- `getStaticProps`
- API routes in `pages/api/`

Client-side code debugs differently (use browser debugger).

---

## 📚 VS Code Debug UI

### Debug Toolbar

When debugging, you get:

- **Continue** (F5): Resume execution
- **Step Over** (F10): Next line
- **Step Into** (F11): Enter function
- **Step Out** (Shift+F11): Exit function
- **Restart** (Ctrl+Shift+F5): Restart debugger
- **Stop** (Shift+F5): Stop debugging

### Debug Console

- View: **Debug Console** panel (bottom)
- Evaluate expressions: Type JS/TS and press Enter
- Access variables: `console.log(myVar)` works here

### Variables Panel

- **Local**: Current scope variables
- **Closure**: Parent scope variables
- **Global**: Window/global objects

### Watch Panel

Add expressions to monitor:

1. Click **"+"** in Watch panel
2. Type expression: `user.email`
3. Value updates as you step through

### Call Stack

See execution path:

- Current function (top)
- Caller functions (below)
- Click to jump to that frame

---

## 🎓 Advanced Tips

### Conditional Breakpoints

Right-click breakpoint → **Edit Breakpoint** → Add condition:

```javascript
user.id === '123'; // Only break if true
```

### Logpoints (Breakpoints that Log)

Right-click gutter → **Add Logpoint**:

```javascript
User: {user.name}, Email: {user.email}
```

Logs without stopping execution!

### Debugging Tests

Add to `launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

---

## 🆚 Console Ninja vs Traditional Debugging

| Feature           | Console Ninja   | Debugger            |
| ----------------- | --------------- | ------------------- |
| Speed             | ⚡ Instant      | 🐢 Pauses execution |
| Inline output     | ✅ Yes          | ❌ No               |
| Pause execution   | ❌ No           | ✅ Yes              |
| Step through      | ❌ No           | ✅ Yes              |
| Inspect variables | ✅ Limited      | ✅ Full access      |
| Network logs      | ✅ Auto         | ⚠️ Manual           |
| Best for          | Quick iteration | Deep inspection     |

**Recommendation:** Use both! Console Ninja for rapid feedback, debugger for complex issues.

---

## 📖 Learn More

- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Next.js Debugging](https://nextjs.org/docs/advanced-features/debugging)
- [Azure Functions Debugging](https://learn.microsoft.com/azure/azure-functions/functions-develop-vs-code)
- [Console Ninja Docs](https://console-ninja.com/)

---

## LITLABS 2026 - Debug Like a Pro! 🐛✨
