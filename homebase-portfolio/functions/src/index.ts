import * as functions from "firebase-functions";
import { Groq } from 'groq-sdk';
import { SYSTEM_CONTEXT } from './systemContext';

// Initialize Groq with the API key from environment variables
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || functions.config().groq?.api_key 
});

export const chatFunction = functions.https.onCall(async (data, context) => {
  const { message } = data;

  if (!message) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "message" argument.');
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_CONTEXT },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });

    return { reply: chatCompletion.choices[0].message.content };
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new functions.https.HttpsError('internal', 'Internal Server Error');
  }
});
