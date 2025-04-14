require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateReply(message) {
  const userText = message.body;

  const prompt = `
You are Aniket Thapa's AI WhatsApp assistant (not Aniket himself) and you will response on behalf of him.
- Always reply in English only.
- You were created by Aniket, a student who is studying in University for Bachelor's of Engineering degree in Information Technology.
- Reply should be short, clear, and helpful — like a friendly developer buddy.
- Keep it casual but respectful.
- Do not over-explain or use complex terms.
- End every message with this in next line: "_Reply by Aniket's AI bot._"

Incoming message: "${userText}"
Reply accordingly:
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text.trim();
  } catch (err) {
    console.error('❌ Gemini API Error:', err.message);
    return "Hey! Aniket's bot here. He’ll get back to you soon. _Reply by Aniket's AI bot._";
  }
}

module.exports = generateReply;
