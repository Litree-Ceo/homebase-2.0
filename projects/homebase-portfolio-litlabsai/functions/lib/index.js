"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatFunction = exports.deleteProject = exports.updateProject = exports.getProjects = exports.getProject = exports.createProject = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const groq_sdk_1 = require("groq-sdk");
const systemContext_1 = require("./systemContext");
admin.initializeApp();
// Export project-related functions
var projects_1 = require("./projects");
Object.defineProperty(exports, "createProject", { enumerable: true, get: function () { return projects_1.createProject; } });
Object.defineProperty(exports, "getProject", { enumerable: true, get: function () { return projects_1.getProject; } });
Object.defineProperty(exports, "getProjects", { enumerable: true, get: function () { return projects_1.getProjects; } });
Object.defineProperty(exports, "updateProject", { enumerable: true, get: function () { return projects_1.updateProject; } });
Object.defineProperty(exports, "deleteProject", { enumerable: true, get: function () { return projects_1.deleteProject; } });
// Initialize Groq with the API key from environment variables
const groq = new groq_sdk_1.Groq({
    apiKey: process.env.GROQ_API_KEY
});
const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const tokenSaverEnabled = process.env.GROQ_TOKEN_SAVER === "true";
const defaultModel = tokenSaverEnabled ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";
const model = process.env.GROQ_MODEL || defaultModel;
const maxCompletionTokens = toNumber(process.env.GROQ_MAX_COMPLETION_TOKENS, tokenSaverEnabled ? 256 : 800);
const maxInputChars = toNumber(process.env.GROQ_MAX_INPUT_CHARS, tokenSaverEnabled ? 2200 : 6000);
const compactSystemContext = "You are Fallen Angel AI. Reply in short, poetic, cyber-melancholic style. Give direct, accurate guidance. Keep answers concise unless asked for detail.";
exports.chatFunction = functions.https.onCall(async (request) => {
    const { message } = request.data || {};
    if (!message || typeof message !== "string") {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "message" argument.');
    }
    const normalizedMessage = message.trim().slice(0, maxInputChars);
    const systemPrompt = tokenSaverEnabled ? compactSystemContext : systemContext_1.SYSTEM_CONTEXT;
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
    }
    catch (error) {
        console.error("Error calling Groq API:", error);
        throw new functions.https.HttpsError('internal', 'Internal Server Error');
    }
});
//# sourceMappingURL=index.js.map