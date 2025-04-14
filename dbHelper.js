const mongoose = require('mongoose');

// Define the schema for conversation history
const conversationSchema = new mongoose.Schema({
  userId: String,
  conversation: [
    {
      message: String,
      sender: { type: String, enum: ['user', 'bot'] },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Conversation = mongoose.model('Conversation', conversationSchema);

// Function to get the user's conversation history
async function getUserConversationHistory(userId) {
  try {
    const conversation = await Conversation.findOne({ userId });
    return conversation ? conversation.conversation : [];
  } catch (err) {
    console.error('❌ Error fetching conversation history:', err);
    return [];
  }
}

// Function to save a user's message to the conversation history
async function saveUserMessage(userId, sender, message) {
  try {
    const conversation = await Conversation.findOne({ userId });

    if (conversation) {
      // Add new message to existing conversation
      conversation.conversation.push({
        sender,
        message,
        timestamp: new Date(),
      });
      await conversation.save();
    } else {
      // Create a new conversation entry for the user
      const newConversation = new Conversation({
        userId,
        conversation: [
          {
            sender,
            message,
            timestamp: new Date(),
          },
        ],
      });
      await newConversation.save();
    }
  } catch (err) {
    console.error('❌ Error saving message:', err);
  }
}

module.exports = { getUserConversationHistory, saveUserMessage };
