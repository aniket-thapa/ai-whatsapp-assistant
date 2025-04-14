require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const generateReply = require('./handlers/messageHandler');
const mongoose = require('mongoose');
const { saveUserMessage } = require('./dbHelper');

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: process.env.SESSION_PATH || './auth_data',
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox'],
  },
});

let isBotActive = true;
const TOGGLE_TARGET = '917889793004@c.us'; // Change to your number
const TOGGLE_MESSAGE = '#toggle bot';

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('📱 Scan the QR code above to log in.');
});

client.on('ready', () => {
  console.log('✅ WhatsApp bot is ready!');
});

// Listen to all sent and received messages
client.on('message_create', async (msg) => {
  const msgText = msg.body.toLowerCase().trim();

  // Check if the message is from you and matches the toggle command
  if (msg.fromMe && msg.to === TOGGLE_TARGET && msgText === TOGGLE_MESSAGE) {
    isBotActive = !isBotActive;
    await msg.reply(`🤖 Bot is now *${isBotActive ? 'ON ✅' : 'OFF 🛑'}*`);
    console.log(`⚙️ Bot toggled: ${isBotActive ? 'ON' : 'OFF'}`);
    return;
  }
});

// Handle incoming messages from others (not from you)
client.on('message', async (message) => {
  const msgText = message.body.toLowerCase().trim();

  // Ignore group messages
  if (message.from.includes('@g.us')) return;

  // Only reply if bot is ON and message is not from you
  if (isBotActive && !message.fromMe) {
    try {
      const reply = await generateReply(message);
      await message.reply(reply);
    } catch (err) {
      console.error('❌ Reply Error:', err.message);
      await message.reply('Oops! Something went wrong.');
    }
  }
});

client.initialize();
