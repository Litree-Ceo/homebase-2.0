/**
 * Copilot API Handler
 * Processes requests from Microsoft 365 Copilot
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

interface CopilotRequest {
  function: string;
  parameters: Record<string, string | string[]>;
  user_id: string;
  context?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: CopilotRequest = await request.json();
    const { function: functionName, parameters, user_id } = body;

    // Get user's Microsoft token
    const userDoc = await getDoc(doc(db as any, 'users', user_id));
    const userData = userDoc.data();

    if (!userData?.tokens?.access_token) {
      return NextResponse.json(
        { error: 'User not authenticated with Microsoft 365' },
        { status: 401 }
      );
    }

    const graphClient = getMicrosoftGraphClient();
    let result;

    switch (functionName) {
      case 'generateContent':
        result = await handleGenerateContent(parameters);
        break;

      case 'analyzeMetrics':
        result = await handleAnalyzeMetrics(user_id, parameters);
        break;

      case 'manageSubscription':
        result = await handleManageSubscription(user_id, parameters);
        break;

      case 'sendEmail':
        result = await handleSendEmail(
          graphClient,
          userData.tokens.access_token,
          parameters
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown function: ${functionName}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Copilot API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGenerateContent(parameters: Record<string, string | string[]>) {
  const { content_type, topic, tone = 'professional', length = 'medium' } = parameters;

  // Call the existing AI API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/ai/generate-content`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_type,
        topic,
        tone,
        length,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`AI API failed: ${response.statusText}`);
  }

  return response.json();
}

async function handleAnalyzeMetrics(
  userId: string,
  parameters: Record<string, string | string[]>
) {
  const { metric_type, time_period = 'month' } = parameters;

  // Get user's metrics from Firestore
  const userDoc = await getDoc(doc(db as any, 'users', userId));
  const userData = userDoc.data();

  // Placeholder metrics - replace with real data
  return {
    metric_type,
    time_period,
    data: {
      engagement: 2500,
      reach: 15000,
      conversion_rate: 0.085,
      revenue: userData?.subscription_tier === 'pro' ? 5000 : 1000,
    },
    summary: `Performance metrics for ${time_period}: ${metric_type} trending ${Math.random() > 0.5 ? 'up' : 'down'}.`,
  };
}

async function handleManageSubscription(
  userId: string,
  parameters: Record<string, string | string[]>
) {
  const { action } = parameters;

  const userDoc = await getDoc(doc(db as any, 'users', userId));
  const userData = userDoc.data();

  switch (action) {
    case 'view_plan':
      return {
        current_plan: userData?.subscription_tier || 'free',
        renewal_date: userData?.subscription_renews_at,
        features_available: ['AI content', 'Analytics', 'Email integration'],
      };

    case 'upgrade':
      return {
        available_plans: ['starter', 'creator', 'pro', 'agency'],
        description: 'Please visit the billing page to upgrade your plan.',
      };

    case 'downgrade':
      return {
        description: 'Downgrading will reduce your feature access. Please confirm.',
      };

    case 'view_invoice':
      return {
        latest_invoice: {
          amount: 29.99,
          date: new Date().toISOString(),
          status: 'paid',
        },
      };

    default:
      return { error: 'Unknown action' };
  }
}

async function handleSendEmail(
  graphClient: ReturnType<typeof getMicrosoftGraphClient>,
  accessToken: string,
  parameters: Record<string, string | string[]>
) {
  const { to, subject, body } = parameters;

  await graphClient.sendEmail(
    accessToken,
    Array.isArray(to) ? to : [to as string],
    subject as string,
    body as string
  );

  return {
    success: true,
    message: `Email sent to ${Array.isArray(to) ? to.join(', ') : to}`,
  };
}
