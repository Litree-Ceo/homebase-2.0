/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Secure Gemini API Proxy Server
 * Protects API key by proxying requests from frontend
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

// Load environment variables
const envResult = dotenv.config({ path: '../.env' });
if (envResult.error) {
    console.warn('Warning: .env file not found. Using environment variables.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI with API key from environment
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
    console.error('ERROR: No API key found. Set GEMINI_API_KEY in .env file');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate styles endpoint
app.post('/api/generate-styles', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const stylePrompt = `Generate 3 creative Metaverse design directions for: "${prompt}". Return ONLY a JSON array of 3 style names (strings). Example: ["Cybernetic Glass", "Volumetric Neon", "Brutalist Void"]`;
        
        const styleResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: { role: 'user', parts: [{ text: stylePrompt }] }
        });

        let generatedStyles = ["Cybernetic Glass", "Volumetric Neon", "Brutalist Void"];
        try {
            const text = styleResponse.text || '';
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed) && parsed.length >= 3) {
                    generatedStyles = parsed.slice(0, 3);
                }
            }
        } catch (parseError) {
            console.warn('Failed to parse styles, using defaults:', parseError.message);
        }

        res.json({ styles: generatedStyles });
    } catch (error) {
        console.error('Generate styles error:', error);
        res.status(500).json({ 
            error: 'Failed to generate styles',
            details: error.message 
        });
    }
});

// Generate artifact endpoint with streaming
app.post('/api/generate-artifact', async (req, res) => {
    try {
        const { prompt, styleInstruction } = req.body;
        if (!prompt || !styleInstruction) {
            return res.status(400).json({ 
                error: 'Both prompt and styleInstruction are required' 
            });
        }

        const fullPrompt = `Create a high-fidelity Metaverse UI widget for: "${prompt}". Style: ${styleInstruction}. Return RAW HTML/CSS in a single file. Include inline CSS styles. Make it visually stunning and futuristic.`;

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.0-flash-exp',
            contents: [{ parts: [{ text: fullPrompt }], role: "user" }],
        });

        let accumulatedHtml = '';
        for await (const chunk of responseStream) {
            accumulatedHtml += chunk.text || '';
        }

        // Clean up the HTML
        const finalHtml = accumulatedHtml
            .replace(/```html/g, '')
            .replace(/```/g, '')
            .trim();

        res.json({ html: finalHtml, status: 'complete' });
    } catch (error) {
        console.error('Generate artifact error:', error);
        res.status(500).json({ 
            error: 'Failed to generate artifact',
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Gemini Proxy Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
