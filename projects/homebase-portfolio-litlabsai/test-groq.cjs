const Groq = require('groq-sdk');
const key = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const maxCompletionTokens = Number(process.env.GROQ_MAX_COMPLETION_TOKENS || 80);

if (!key || key === "YOUR_GROQ_API_KEY") {
  console.log("❌ Error: GROQ_API_KEY is not set in .env");
  console.log("Please update your .env file with a valid key from https://console.groq.com/");
  process.exit(1);
}

const groq = new Groq({ apiKey: key });

async function test() {
  try {
    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Reply with exactly: Groq is working" }],
      model,
      max_completion_tokens: maxCompletionTokens,
    });
    console.log("✅ GROQ WORKS:", chat.choices[0].message.content);
  } catch (e) {
    console.log("❌ Error:", e.message);
  }
}
test();
