import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Groq } from 'groq-sdk';
import { SYSTEM_CONTEXT } from './systemContext';

admin.initializeApp();

// Export project-related functions
export {
  createProject,
  getProject,
  getProjects,
  updateProject,
  deleteProject,
} from "./projects";

// Initialize Groq with the API key from environment variables
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const tokenSaverEnabled = process.env.GROQ_TOKEN_SAVER === "true";
const defaultModel = tokenSaverEnabled ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";
const model = process.env.GROQ_MODEL || defaultModel;
const maxCompletionTokens = toNumber(
  process.env.GROQ_MAX_COMPLETION_TOKENS,
  tokenSaverEnabled ? 256 : 800
);
const maxInputChars = toNumber(
  process.env.GROQ_MAX_INPUT_CHARS,
  tokenSaverEnabled ? 2200 : 6000
);
const compactSystemContext =
  "You are Fallen Angel AI. Reply in short, poetic, cyber-melancholic style. Give direct, accurate guidance. Keep answers concise unless asked for detail.";

export const chatFunction = functions.https.onCall(async (request) => {
  const { message } = request.data || {};

  if (!message || typeof message !== "string") {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "message" argument.');
  }

  const normalizedMessage = message.trim().slice(0, maxInputChars);
  const systemPrompt = tokenSaverEnabled ? compactSystemContext : SYSTEM_CONTEXT;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: normalizedMessage }
      ],
      model,
      max_completion_tokens: maxCompletionTokens,
    });

    return { reply: chatCompletion.choices[0].message.content };
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new functions.https.HttpsError('internal', 'Internal Server Error');
  }
});
