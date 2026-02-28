require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// CRITICAL SECURITY: Only allow your Telegram account to make moves
const MY_TELEGRAM_ID = parseInt(process.env.MY_TELEGRAM_ID, 10);

if (isNaN(MY_TELEGRAM_ID)) {
  console.error('Error: MY_TELEGRAM_ID is not set in your .env file. Please add your Telegram User ID to prevent unauthorized access.');
  process.exit(1);
}

// Listen for any message starting with a slash, like /dir or /ipconfig
bot.onText(/\/(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1];

  // Block unauthorized users
  if (chatId !== MY_TELEGRAM_ID) {
    bot.sendMessage(chatId, "Unauthorized user.");
    console.log(`Unauthorized access attempt from chat ID: ${chatId}`);
    return;
  }

  console.log(`Executing command: '${command}' for user ${chatId}`);

  // Execute the command on the PC
  exec(command, (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(chatId, `Error:\n${error.message}`);
      return;
    }
    if (stderr) {
      bot.sendMessage(chatId, `Stderr:\n${stderr}`);
      return;
    }
    // Handle potentially large output
    const output = stdout.length > 4096 ? stdout.substring(0, 4090) + '...' : stdout;
    bot.sendMessage(chatId, `Output:\n${output}`);
  });
});

console.log(`Command bot started. Listening for commands from user ID: ${MY_TELEGRAM_ID}...`);
