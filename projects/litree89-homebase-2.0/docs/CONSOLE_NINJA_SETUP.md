# Console Ninja Setup - HomeBase 2.0

## ✅ Installation Complete

Console Ninja has been configured for the HomeBase 2.0 project! This powerful debugging tool displays `console.log` output and runtime errors directly in your editor from your running browser or Node.js application.

## 🚀 What's Been Set Up

### 1. Extension Installed

- **Console Ninja** (wallabyjs.console-ninja) is installed and active
- Added to recommended extensions in `.vscode/extensions.json`

### 2. Optimal Configuration

Added to `.vscode/settings.json`:

```json
{
  "console-ninja.featureSet": "Community",
  "console-ninja.outputMode": "Beside File",
  "console-ninja.showWelcomeMessageInTools": false,
  "console-ninja.captureFunctions": true,
  "console-ninja.output.showErrorStackTrace": true,
  "console-ninja.output.showFileLinks": true,
  "console-ninja.output.showInlineErrors": true,
  "console-ninja.output.showNetworkRequests": true
}
```

## 📖 How to Use Console Ninja

### Basic Usage

1. **Run your app**: Start your dev server (e.g., `pnpm -C apps/web dev` or `pnpm -C api start`)
2. **Add console.log**: Add `console.log()` statements in your code
3. **See results inline**: Output appears right next to your code in the editor!

### For This Project

#### Frontend (Next.js)

```bash
pnpm -C apps/web dev
```

Then add logs to any file in `apps/web/src/`:

```typescript
console.log('User data:', user);
```

#### Backend (Azure Functions)

```bash
pnpm -C api start
```

Then add logs to any function:

```typescript
console.log('Request received:', context.req.body);
```

### Advanced Features

#### View All Logs

- Use Command Palette: `Console Ninja: Show Output`
- Or hover over any console.log output and click "Show in Console Output"

#### Log Viewer Navigation

- `Arrow Up/Down`: Navigate between log entries
- `Home/End`: Jump to first/last entry
- `Ctrl/Cmd + F`: Search logs

#### Supported Console Methods

- `console.log()` - Standard logging
- `console.trace()` - Shows call stack
- `console.time()` / `console.timeEnd()` - Performance timing
- Runtime errors - Displayed automatically

## 🎯 Project-Specific Benefits

### For HomeBase 2.0

1. **Full-Stack Debugging**: See both frontend (Next.js) and backend (Azure Functions) logs
2. **Hot Reload Support**: Works with Next.js and Azure Functions watch mode
3. **No Context Switching**: Debug without opening browser DevTools
4. **Multi-Tool Support**: Handles Vite, Next.js, Node.js - all used in this project

### Supported Technologies in This Project

✅ Next.js (apps/web)
✅ Azure Functions (api)
✅ Express.js (packages/api)
✅ Node.js applications
✅ TypeScript
✅ React

## 🔧 Troubleshooting

### If Console Ninja isn't working:

1. **Check Status**: Hover over the Console Ninja icon in the VS Code status bar
2. **Restart Dev Server**: Stop and restart your `pnpm dev` command
3. **Clear Build Cache**:

   ```powershell
   # For Next.js
   Remove-Item -Force -Recurse apps/web/.next

   # For Azure Functions
   Remove-Item -Force -Recurse api/dist
   ```

4. **Check Firewall/VPN**: Console Ninja uses WebSocket (localhost), VPNs can interfere

### Common Issues

#### Issue: "Console Ninja is not running"

**Solution**: Make sure your dev server is running in VS Code's integrated terminal

#### Issue: No output appearing

**Solution**:

1. Trigger the code path (click button, make API call)
2. Check if code is actually executing (add debugger statement)
3. Verify the file is opened in VS Code

#### Issue: VPN interference

**Solution**: Temporarily disconnect VPN or add localhost to whitelist

## 🎓 Pro Tips

### 1. Use with Copilot

Console Ninja integrates with GitHub Copilot! When you see an error, click "Investigate with AI" to get intelligent debugging assistance.

### 2. Network Logging

Automatically captures `fetch` and `XMLHttpRequest` calls - great for debugging API issues!

### 3. Multi-Window Debugging

Open log viewer in "Beside File" mode (default) to see code and logs side-by-side.

### 4. Performance Tracking

Use `console.time('label')` and `console.timeEnd('label')` to measure execution time inline.

## 📚 Learn More

- [Official Docs](https://console-ninja.com/)
- [GitHub Repo](https://github.com/wallabyjs/console-ninja)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=WallabyJs.console-ninja)

## 🆙 Upgrade to Pro (Optional)

Console Ninja Community is free forever. Pro features include:

- Watchpoints (monitor values in real-time)
- Logpoints (log without modifying code)
- Code coverage visualization
- Advanced filtering and search
- Predictive logging

[Learn about Pro features](https://console-ninja.com/pro)

---

## Next Steps

1. **Test it now**:

   ```bash
   # Start frontend
   pnpm -C apps/web dev

   # Or start API
   pnpm -C api start
   ```

2. **Add a test log**:
   Open any `.ts`/`.tsx` file and add:

   ```typescript
   console.log('🎉 Console Ninja is working!', { timestamp: new Date() });
   ```

3. **See the magic**: Output appears right in your editor!

Happy debugging! 🥷✨
