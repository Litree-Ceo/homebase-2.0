/**
 * SignalR WebSocket Hub Endpoint
 * Handles real-time notifications and live updates
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for connected clients
const connectedClients = new Set<string>();

export async function GET(request: NextRequest) {
  try {
    // Handle WebSocket upgrade request
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId') || crypto.randomUUID();

    // Register client
    connectedClients.add(clientId);

    // Return success response for negotiation
    return NextResponse.json(
      {
        negotiateVersion: 0,
        connectionId: clientId,
        availableTransports: [
          {
            transport: 'WebSockets',
            transferFormats: ['text', 'binary'],
          },
          {
            transport: 'ServerSentEvents',
            transferFormats: ['text'],
          },
        ],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SignalR Hub] Error:', error);
    return NextResponse.json({ error: 'Hub negotiation failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { protocol, version } = body;

    if (protocol !== 'messagepack' && protocol !== 'json') {
      return NextResponse.json(
        { error: 'Unsupported protocol' },
        { status: 400 }
      );
    }

    // Confirm protocol handshake
    return NextResponse.json(
      { protocol, version },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SignalR Hub] POST Error:', error);
    return NextResponse.json({ error: 'Handshake failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');

    if (clientId) {
      connectedClients.delete(clientId);
    }

    return NextResponse.json({ status: 'disconnected' });
  } catch (error) {
    console.error('[SignalR Hub] DELETE Error:', error);
    return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 });
  }
}
