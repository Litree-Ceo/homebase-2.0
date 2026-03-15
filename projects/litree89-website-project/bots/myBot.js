// bots/myBot.js
// Simple custom bot template

const { askOpenAI } = require("../backend/ai");

module.exports = {
  name: "myBot",
  description: "Main smart agent bot powered by OpenAI.",
  /**
   * Handles a message and returns a smart response.
   * @param {string} message
   * @param {object} context
   * @returns {Promise<object>}
   */
  async handleMessage(message, context) {
    // Compose system prompt for agent behavior
    const systemPrompt =
      "You are an extremely smart, action-oriented AI agent. You get things done fast, can reason, plan, and execute multi-step tasks. Always be concise, direct, and helpful.";
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];
    const reply = await askOpenAI(messages);
    return { reply, context };
  },
};
