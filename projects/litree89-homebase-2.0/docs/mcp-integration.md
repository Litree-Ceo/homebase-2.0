# MCP Integration Plan for HomeBase 2.0

Summary
- Audit found no project-level MCP integration; references only exist inside dependencies (OpenAI SDK, packages) and a changelog.
- Goal: add clear documentation, scaffold a TypeScript client example, and provide install/run steps so the repo can call MCP servers safely.

Why MCP
- MCP enables LLM-powered features to call external tools and data sources in a standardized, auditable way.
- We will add a minimal integration path so backend services (api/) or server-side parts of the frontend can call MCP servers.

Quick checklist (high level)
- [x] Audit repo for MCP mentions
- [x] Confirm no existing integration/config
- [ ] Add docs entry & integration plan (this file)
- [ ] Add TypeScript SDK to workspace and scaffold example client
- [ ] Add optional sample MCP server scaffold under servers/
- [ ] Add tests/mocks for MCP calls
- [ ] Add CI step to validate MCP calls are mocked in PRs

Install TypeScript SDK (recommended)
- Preferred (install latest from upstream repo):
  pnpm add -w github:modelcontextprotocol/typescript-sdk
- If an NPM-scoped package exists:
  pnpm add -w @modelcontextprotocol/typescript-sdk

Scaffold: packages/core/src/mcp-client-example.ts
- Create a small, single-file client that shows how to list tools and invoke a simple read-only tool.
- Path: packages/core/src/mcp-client-example.ts (example code below)

Example TypeScript usage (replace SERVER_URL and OAUTH_TOKEN with your values):

```ts
// mcp-client-example.ts
import fetch from 'node-fetch'; // runtime: node 20+ has fetch globally; use node-fetch for older runtimes

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://example-mcp-server.local';
const MCP_OAUTH_TOKEN = process.env.MCP_OAUTH_TOKEN || '<YOUR_TOKEN>';

async function listTools() {
  const res = await fetch(`${MCP_SERVER_URL}/v1/tools`, {
    headers: {
      Authorization: `Bearer ${MCP_OAUTH_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`MCP list tools failed: ${res.statusText}`);
  return res.json();
}

async function invokeTool(toolLabel: string, args: Record<string, unknown>) {
  const res = await fetch(`${MCP_SERVER_URL}/v1/tools/${encodeURIComponent(toolLabel)}/call`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MCP_OAUTH_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ args }),
  });
  if (!res.ok) throw new Error(`MCP tool call failed: ${res.statusText}`);
  return res.json();
}

// Example entrypoint
if (require.main === module) {
  (async () => {
    try {
      console.log('Listing MCP tools...');
      const tools = await listTools();
      console.log('Tools:', tools);
    } catch (err) {
      console.error('MCP error', err);
      process.exit(1);
    }
  })();
}
```

Security & approvals
- Use OAuth tokens or a service connector; never commit tokens.
- Configure require_approval for mutating tools (see MCP spec) and add CI gating so production access requires manual review.
- Add an entry in docs/deployment/ with auth setup steps if you plan to register a dedicated MCP server.

Next actions I can take (pick one or approve all)
- Create packages/core/src/mcp-client-example.ts with the sample code above.
- Add pnpm workspace dependency (one-time change to package.json/pnpm-workspace) and update README with install instructions.
- Scaffold a minimal servers/mcp-sample/ Express/Ktor server (read-only) that implements a simple MCP tool.

Notes
- I used a simple HTTP example to avoid coupling to any specific SDK; installing the TypeScript SDK is recommended for richer features (auth helpers, typed tool calls).
- After you confirm, I will create the example client file and add the install instructions into package.json or workspace manifest as requested.