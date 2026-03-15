// backend/botHandler.js
// Loads and routes messages to bots in the bots/ directory

const fs = require("fs");
const path = require("path");

const botsDir = path.join(__dirname, "../bots");

// Load all bots
const bots = {};
fs.readdirSync(botsDir).forEach((file) => {
  if (file.endsWith(".js")) {
    const bot = require(path.join(botsDir, file));
    bots[bot.name] = bot;
  }
});

// Route a message to a bot by name (async)
async function routeToBot(botName, message, context = {}) {
  // Default to 'myBot' if not specified
  const name = botName || "myBot";
  const bot = bots[name];
  if (!bot) throw new Error(`Bot '${name}' not found.`);
  // Support async bot handlers
  return await bot.handleMessage(message, context);
}

module.exports = { bots, routeToBot };
