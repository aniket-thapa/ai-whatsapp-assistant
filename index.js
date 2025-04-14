require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const generateReply = require('./handlers/messageHandler');
const downloadAndUnzipSession = require('./downloadSession');

const SESSION_PATH = process.env.SESSION_PATH || './auth_data';

// ✅ Start after making sure auth_data is available
(async () => {
  await downloadAndUnzipSession();

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: SESSION_PATH,
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox'],
    },
  });

  let isBotActive = true;

  // ✅ Number to send toggle message to (your own WhatsApp number in international format)
  const TOGGLE_TARGET = '917889793004@c.us'; // Replace with your number
  const TOGGLE_MESSAGE = '#toggle bot';

  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Scan the QR code above to log in.');
  });

  client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
  });

  // ✅ Detect toggle messages you send to yourself
  client.on('message_create', async (msg) => {
    const msgText = msg.body.toLowerCase().trim();

    // Toggle logic: only when you send to TOGGLE_TARGET
    if (msg.fromMe && msg.to === TOGGLE_TARGET && msgText === TOGGLE_MESSAGE) {
      isBotActive = !isBotActive;
      await msg.reply(`🤖 Bot is now *${isBotActive ? 'ON ✅' : 'OFF 🛑'}*`);
      console.log(`⚙️ Bot toggled: ${isBotActive ? 'ON' : 'OFF'}`);
      return;
    }
  });

  // ✅ Handle incoming personal messages
  client.on('message', async (message) => {
    if (message.from.includes('@g.us')) return; // Ignore group chats

    if (isBotActive && !message.fromMe) {
      try {
        const reply = await generateReply(message);
        await message.reply(reply);
      } catch (err) {
        console.error('❌ Reply Error:', err.message);
        await message.reply("Oops! I'm having trouble replying right now.");
      }
    }
  });

  client.initialize();
})();
