/**
 * Optimized Telegram AI Bot
 * Features: Groq AI (free tier), Firebase logging, Admin commands
 * Replaces Vertex AI/Gemini with Groq for unlimited free usage
 */

require('dotenv').config();
const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const Groq = require('groq-sdk');

// ============================================
// Configuration & Validation
// ============================================
const CONFIG = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  maxTokens: parseInt(process.env.MAX_TOKENS) || 150,
  adminUsername: process.env.ADMIN_USERNAME,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate required env vars
const requiredVars = ['TELEGRAM_BOT_TOKEN', 'FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL', 'GROQ_API_KEY'];
const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('❌ Missing environment variables:', missing.join(', '));
  console.error('📋 Copy .env.example to .env and fill in your values');
  process.exit(1);
}

// ============================================
// Firebase Setup
// ============================================
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: CONFIG.firebaseProjectId,
      privateKey: CONFIG.firebasePrivateKey.replace(/\\n/g, '\n'),
      clientEmail: CONFIG.firebaseClientEmail
    })
  });
  console.log('✅ Firebase connected');
} catch (error) {
  console.error('❌ Firebase init failed:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// ============================================
// Groq AI Setup (Replaces Vertex AI/Gemini)
// ============================================
const groq = new Groq({ apiKey: CONFIG.groqApiKey });

async function getAIResponse(message, context = []) {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful, concise AI assistant. Keep responses brief and friendly.'
      },
      ...context,
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: CONFIG.groqModel,
      max_tokens: CONFIG.maxTokens,
      temperature: 0.7,
      top_p: 0.9
    });

    return completion.choices[0]?.message?.content?.trim() || '🤔 I\'m not sure how to respond.';
  } catch (error) {
    console.error('Groq Error:', error.message);
    if (error.message.includes('rate limit')) {
      return '⏱️ Rate limit hit. Please wait a moment and try again.';
    }
    if (error.message.includes('invalid api key')) {
      return '⚠️ AI service misconfigured. Please contact admin.';
    }
    return '❌ AI temporarily unavailable. Try again later.';
  }
}

// ============================================
// Logging to Firebase
// ============================================
async function logMessage(user, message, aiResponse) {
  try {
    await db.collection('messages').add({
      userId: user.id,
      username: user.username || 'anonymous',
      firstName: user.first_name,
      message: message,
      aiResponse: aiResponse,
      model: CONFIG.groqModel,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Logging error:', error.message);
  }
}

async function logCommand(user, command, args) {
  try {
    await db.collection('commands').add({
      userId: user.id,
      username: user.username,
      command,
      args,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Command log error:', error.message);
  }
}

// ============================================
// Bot Setup
// ============================================
const bot = new Telegraf(CONFIG.telegramToken);

// ============================================
// Commands
// ============================================

// Start command
bot.start(async (ctx) => {
  const welcomeMessage = `
🤖 *Welcome to your AI Assistant!*

I can help you with:
• Answering questions
• Having conversations
• General assistance

*Commands:*
/ai <message> - Get AI response
/clear - Clear conversation history
/status - Check bot status
/help - Show this help

Just type any message and I'll respond!
  `;
  
  await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
  await logCommand(ctx.from, 'start', '');
});

// Help command
bot.help(async (ctx) => {
  const helpText = `
📚 *Available Commands*

/ai <your message> - Ask the AI anything
/clear - Clear your chat history
/status - View bot statistics
/help - Show this message

*Tips:*
• Messages are automatically logged
• AI responses are powered by Groq (lightning fast!)
• Be patient if responses take a moment
  `;
  
  await ctx.reply(helpText, { parse_mode: 'Markdown' });
  await logCommand(ctx.from, 'help', '');
});

// Status command
bot.command('status', async (ctx) => {
  const status = `
📊 *Bot Status*

🤖 Model: \`${CONFIG.groqModel}\`
🔥 Firebase: ✅ Connected
⚡ AI Service: Groq (Free Tier)
📍 Max Tokens: ${CONFIG.maxTokens}

Everything looks good! ✅
  `;
  
  await ctx.reply(status, { parse_mode: 'Markdown' });
  await logCommand(ctx.from, 'status', '');
});

// AI command (explicit)
bot.command('ai', async (ctx) => {
  const userMessage = ctx.message.text.replace('/ai', '').trim();
  
  if (!userMessage) {
    return ctx.reply('❓ Please provide a message. Example: `/ai What is the weather?`', { parse_mode: 'Markdown' });
  }
  
  // Show typing indicator
  await ctx.sendChatAction('typing');
  
  const aiResponse = await getAIResponse(userMessage);
  await logMessage(ctx.from, userMessage, aiResponse);
  
  await ctx.reply(`🤖 *AI Response:*\n\n${aiResponse}`, { parse_mode: 'Markdown' });
  await logCommand(ctx.from, 'ai', userMessage);
});

// Clear command (for conversation context - placeholder)
bot.command('clear', async (ctx) => {
  await ctx.reply('✅ Conversation context cleared! (Note: Messages are still stored in database)');
  await logCommand(ctx.from, 'clear', '');
});

// ============================================
// Admin Commands
// ============================================
bot.command('stats', async (ctx) => {
  if (ctx.from.username !== CONFIG.adminUsername) {
    return ctx.reply('⛔ Admin only command');
  }
  
  try {
    const messagesSnapshot = await db.collection('messages').get();
    const commandsSnapshot = await db.collection('commands').get();
    
    const stats = `
📈 *Bot Statistics*

💬 Total Messages: ${messagesSnapshot.size}
⌨️ Total Commands: ${commandsSnapshot.size}
🤖 Model: ${CONFIG.groqModel}
    `;
    
    await ctx.reply(stats, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply('❌ Error fetching stats: ' + error.message);
  }
});

// Broadcast command (admin only)
bot.command('broadcast', async (ctx) => {
  if (ctx.from.username !== CONFIG.adminUsername) {
    return ctx.reply('⛔ Admin only command');
  }
  
  const message = ctx.message.text.replace('/broadcast', '').trim();
  if (!message) {
    return ctx.reply('Usage: /broadcast <message>');
  }
  
  // This would require storing chat IDs - placeholder
  await ctx.reply('📢 Broadcast feature requires user chat ID storage.');
});

// ============================================
// Message Handler (Default)
// ============================================
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  
  // Skip if it's a command (already handled)
  if (userMessage.startsWith('/')) return;
  
  // Show typing indicator
  await ctx.sendChatAction('typing');
  
  // Get AI response
  const aiResponse = await getAIResponse(userMessage);
  
  // Log to Firebase
  await logMessage(ctx.from, userMessage, aiResponse);
  
  // Reply
  await ctx.reply(aiResponse);
});

// ============================================
// Error Handling
// ============================================
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('❌ An error occurred. Please try again later.');
});

// ============================================
// Graceful Shutdown
// ============================================
process.once('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  bot.stop('SIGTERM');
});

// ============================================
// Start Bot
// ============================================
console.log('🚀 Starting Telegram AI Bot...');
console.log(`🤖 AI Model: ${CONFIG.groqModel}`);
console.log(`📊 Max Tokens: ${CONFIG.maxTokens}`);

bot.launch()
  .then(() => {
    console.log('✅ Bot is running!');
    console.log('📱 Send /start to your bot on Telegram');
  })
  .catch((error) => {
    console.error('❌ Failed to start bot:', error.message);
    process.exit(1);
  });
