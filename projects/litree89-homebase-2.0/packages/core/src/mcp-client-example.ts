/**
 * MCP client example for HomeBase 2.0
 *
 * Minimal, dependency-free example showing how to list tools and invoke a tool on an MCP server.
 * Replace MCP_SERVER_URL and MCP_OAUTH_TOKEN with real values or set environment variables.
 */

const MCP_SERVER_URL = process.env.MCP_SERVER_URL ?? 'https://example-mcp-server.local';
const MCP_OAUTH_TOKEN = process.env.MCP_OAUTH_TOKEN ?? '';

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (MCP_OAUTH_TOKEN) headers.Authorization = `Bearer ${MCP_OAUTH_TOKEN}`;

  const res = await fetch(`${MCP_SERVER_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    /* non-json response */
  }

  if (!res.ok) {
    const msg = typeof body === 'object' ? JSON.stringify(body) : String(body);
    throw new Error(`MCP request failed ${res.status} ${res.statusText}: ${msg}`);
  }
  return body;
}

export async function listTools(): Promise<any> {
  return request('/v1/tools', { method: 'GET' });
}

export async function invokeTool(toolLabel: string, args: Record<string, unknown> = {}): Promise<any> {
  return request(`/v1/tools/${encodeURIComponent(toolLabel)}/call`, {
    method: 'POST',
    body: JSON.stringify({ args }),
  });
}

// CLI entrypoint for quick testing: `node packages/core/src/mcp-client-example.ts` (run via ts-node/tsx)
if (require.main === module) {
  (async () => {
    try {
      console.log('MCP_SERVER_URL=', MCP_SERVER_URL ? MCP_SERVER_URL : '(not set)');
      console.log('Listing MCP tools...');
      const tools = await listTools();
      console.log('Tools:', JSON.stringify(tools, null, 2));
    } catch (err: any) {
      console.error('MCP error:', err?.message ?? err);
      process.exit(1);
    }
  })();
}