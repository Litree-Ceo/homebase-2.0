// backend/ai.js
// OpenAI integration for smart agent responses

const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function askOpenAI(messages, model = "gpt-4") {
  if (!OPENAI_API_KEY) throw new Error("Missing OpenAI API key");
  const response = await axios.post(
    OPENAI_API_URL,
    {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { askOpenAI };
