// api/bot.js
// API endpoint to interact with your custom bot

const { routeToBot } = require("../backend/botHandler");

module.exports = async function (req, res) {
  const { botName, message = "", context = {} } = req.body || {};
  try {
    const result = await routeToBot(botName, message, context);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
