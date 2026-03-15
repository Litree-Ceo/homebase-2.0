const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: true }));
app.use(bodyParser.json());

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  console.log('Firebase Admin initialized.');
} catch (error) {
  console.error('Firebase Admin initialization warning:', error.message);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

app.get('/', (req, res) => {
  res.send('Firebase AI Chat Server (Gemini Pro) is running!');
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ 
        error: 'API Key Missing', 
        details: 'Please add GOOGLE_API_KEY to your .env file.' 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log(`Sending message to Gemini Flash: \${message}`);

    const result = await model.generateContent(message);
    const response = await result.response;
    const aiResponse = response.text();

    res.json({ 
      response: aiResponse,
      model: "gemini-1.5-flash"
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

exports.api = functions.https.onRequest(app);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port \${PORT}`);
  });
}
