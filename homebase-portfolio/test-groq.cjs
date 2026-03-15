require('dotenv').config();
const Groq = require('groq-sdk');
const key = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

if (!key || key === "YOUR_GROQ_API_KEY") {
  console.log("❌ Error: GROQ_API_KEY is not set in .env");
  console.log("Please update your .env file with a valid key from https://console.groq.com/");
  process.exit(1);
}

const groq = new Groq({ apiKey: key });

async function test() {
  try {
    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say 'Groq is working'" }],
      model: "llama-3.3-70b-versatile",
    });
    console.log("✅ GROQ WORKS:", chat.choices[0].message.content);
  } catch (e) {
    console.log("❌ Error:", e.message);
  }
}
test();
