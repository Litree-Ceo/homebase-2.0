import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { deployBot, testBot, publishToMarketplace, createBot, validateBotCode, cloneBot } from '@/lib/bot-builder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, botId, config, code, templateId } = body;

    switch (action) {
      case 'create':
        // Create new bot
        const newBot = await createBot(config, user.uid);
        return NextResponse.json({ success: true, bot: newBot });

      case 'deploy':
        // Deploy bot to environment
        const environment = body.environment || 'production';
        const deployment = await deployBot(botId, environment);
        return NextResponse.json({ success: true, deployment });

      case 'test':
        // Test bot with sample query
        const response = await testBot();
        return NextResponse.json({ success: true, response });

      case 'publish':
        // Publish to marketplace
        const published = await publishToMarketplace(botId);
        return NextResponse.json({ success: true, published });

      case 'validate':
        // Validate bot code
        const validation = validateBotCode(code);
        return NextResponse.json({ success: true, validation });

      case 'clone':
        // Clone from template
        const clonedBot = await cloneBot(templateId, user.uid);
        return NextResponse.json({ success: true, bot: clonedBot });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Studio API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Studio operation failed' },
      { status: 500 }
    );
  }
}
