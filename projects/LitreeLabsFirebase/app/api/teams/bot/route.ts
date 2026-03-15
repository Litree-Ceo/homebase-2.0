/**
 * Teams Bot Handler
 * Handles incoming messages from Teams and routes them to LitLabs AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMicrosoftGraphClient } from '@/lib/microsoft-graph';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

if (!db) {
  throw new Error('Firebase database not initialized');
}

interface TeamsActivity {
  type: string;
  from: {
    id: string;
    name: string;
  };
  conversation: {
    id: string;
  };
  channelData: {
    teamsChannelId: string;
    teamsTeamId: string;
  };
  text: string;
  replyToId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const activity: TeamsActivity = await request.json();

    // Verify webhook token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || token !== process.env.INTERNAL_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle different activity types
    if (activity.type === 'message') {
      return handleMessage(activity);
    } else if (activity.type === 'conversationUpdate') {
      return handleConversationUpdate(activity);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Teams bot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleMessage(activity: TeamsActivity) {
  const userMessage = activity.text.trim();

  if (!userMessage) {
    return NextResponse.json({ ok: true });
  }

  try {
    // Get user's Microsoft token
    const userDoc = await getDoc(doc(db as any, 'users', activity.from.id));
    const userData = userDoc.data();

    if (!userData?.tokens?.access_token) {
      return NextResponse.json(
        {
          error: 'User not authenticated with Microsoft 365',
        },
        { status: 401 }
      );
    }

    // Send message to LitLabs AI for processing
    const aiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/ai-chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId: activity.from.id,
          context: {
            source: 'teams',
            teamId: activity.channelData.teamsTeamId,
            channelId: activity.channelData.teamsChannelId,
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error(`AI API failed: ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();

    // Send AI response back to Teams
    const graphClient = getMicrosoftGraphClient();
    await graphClient.sendTeamsMessage(
      userData.tokens.access_token,
      activity.channelData.teamsTeamId,
      activity.channelData.teamsChannelId,
      `<div><strong>LitLabs AI:</strong><br/>${escapeHtml(aiResult.response)}</div>`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Message handling error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleConversationUpdate(activity: TeamsActivity) {
  // Handle bot added/removed from Teams channel
  console.log('Conversation update:', activity);
  return NextResponse.json({ ok: true });
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
