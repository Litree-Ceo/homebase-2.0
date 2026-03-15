/**
 * Microsoft Graph Webhook Handler
 * Handles incoming webhook notifications for Outlook, Calendar, etc.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface WebhookNotification {
  value: Array<{
    subscriptionId: string;
    subscriptionExpirationDateTime: string;
    changeType: string;
    resource: string;
    clientState: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WebhookNotification;

    // Verify client state (security token)
    if (body.value?.[0]?.clientState !== process.env.INTERNAL_WEBHOOK_SECRET) {
      console.warn('Invalid webhook client state');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process each notification
    for (const notification of body.value || []) {
      await processNotification(notification);
    }

    // Acknowledge receipt (Graph API requires 202 response)
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle webhook validation request from Microsoft
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const validationToken = searchParams.get('validationToken');

  if (validationToken) {
    // Return validation token to confirm webhook endpoint
    return new NextResponse(validationToken, { status: 200 });
  }

  return NextResponse.json({ error: 'No validation token' }, { status: 400 });
}

async function processNotification(notification: {
  subscriptionId: string;
  changeType: string;
  resource: string;
}) {
  try {
    const { changeType, resource } = notification;

    console.log(
      `Processing ${changeType} event for resource: ${resource}`
    );

    // Parse resource type
    if (resource.includes('/messages')) {
      // Email received
      await handleEmailNotification(notification);
    } else if (resource.includes('/events')) {
      // Calendar event changed
      await handleCalendarNotification(notification);
    } else if (resource.includes('/me/todo')) {
      // To-do item changed
      await handleTodoNotification(notification);
    }
  } catch (error) {
    console.error('Error processing notification:', error);
  }
}

async function handleEmailNotification(notification: {
  subscriptionId: string;
  changeType: string;
  resource: string;
}) {
  console.log(`Email ${notification.changeType}: ${notification.resource}`);

  // In a real application, you would:
  // 1. Fetch the full message details from Graph API
  // 2. Process content (extract attachments, check for important keywords)
  // 3. Send notifications to Teams/user dashboard
  // 4. Integrate with AI for smart categorization
}

async function handleCalendarNotification(notification: {
  subscriptionId: string;
  changeType: string;
  resource: string;
}) {
  console.log(`Calendar ${notification.changeType}: ${notification.resource}`);

  // In a real application, you would:
  // 1. Fetch the full event details from Graph API
  // 2. Check for conflicts or important attendees
  // 3. Send reminders to Teams
  // 4. Integrate with LitLabs AI for smart scheduling
}

async function handleTodoNotification(notification: {
  subscriptionId: string;
  changeType: string;
  resource: string;
}) {
  console.log(`Todo ${notification.changeType}: ${notification.resource}`);

  // Process to-do items
}
