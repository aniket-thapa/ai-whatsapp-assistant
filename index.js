require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const generateReply = require('./handlers/messageHandler');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox'],
  },
});

let isBotActive = true;

// ✅ Chat where you'll send toggle message (the person you send to)
const TOGGLE_TARGET = '917889793004@c.us'; // change this
const TOGGLE_MESSAGE = '#toggle bot';

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('📱 Scan the QR code above to log in.');
});

client.on('ready', () => {
  console.log('✅ WhatsApp bot is ready!');
});

// ✅ Listen to *all* sent and received messages
client.on('message_create', async (msg) => {
  const msgText = msg.body.toLowerCase().trim();

  // ✅ Check if this was sent by *you* to the toggle target
  if (msg.fromMe && msg.to === TOGGLE_TARGET && msgText === TOGGLE_MESSAGE) {
    isBotActive = !isBotActive;
    await msg.reply(`🤖 Bot is now *${isBotActive ? 'ON ✅' : 'OFF 🛑'}*`);
    console.log(`⚙️ Bot toggled: ${isBotActive ? 'ON' : 'OFF'}`);
    return;
  }
});

// ✅ Handle incoming messages from others (not from you)
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
