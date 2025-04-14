const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getUserConversationHistory, saveUserMessage } = require('../dbHelper');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateReply(message) {
  const userText = message.body;

  // Fetch the user's conversation history from the database
  const conversationHistory = await getUserConversationHistory(message.from);

  // Format the conversation history into a string to provide context
  let conversationHistoryText = '';
  conversationHistory.forEach((msg) => {
    if (msg.sender === 'user') {
      conversationHistoryText += `User: ${msg.message}\n`;
    } else {
      conversationHistoryText += `AI: ${msg.message}\n`;
    }
  });

  const prompt = `
You are Aniket Thapa's AI WhatsApp assistant (not Aniket himself) and you will response on behalf of him.
- Always reply in English only.
- You were created by Aniket, a student who is studying in University for Bachelor's of Engineering degree in Information Technology.
- Reply should be short, clear, and helpful — like a friendly developer buddy.
- Keep it casual but respectful.
- Do not over-explain or use complex terms.
- End every message with this in next line: "_Reply by Aniket's AI bot._"

Here is the previous conversation:
${conversationHistoryText}

Now, respond to this message from the user: "${userText}"
Reply as Aniket's assistant:
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // After generating the reply, update the conversation history in the database
    await saveUserMessage(message.from, 'user', userText); // Save user's message
    await saveUserMessage(message.from, 'bot', text); // Save bot's reply

    return text.trim();
  } catch (err) {
    console.error('❌ Gemini API Error:', err.message);
    return "Hey! I'm Aniket's assistant. He’ll reply to you soon!";
  }
}

module.exports = generateReply;
