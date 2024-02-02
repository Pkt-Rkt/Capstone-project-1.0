// Import mongoose for MongoDB interactions
const mongoose = require("mongoose");

// Define schema for a conversation
const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: String,
  conversation: [{
    userMessage: String,
    botResponse: String,
  }],
  timestamp: { type: Date, default: Date.now }
});

// Create Conversation model from schema
const ConversationModel = mongoose.model("Conversations", conversationSchema);

// Export model for external use
module.exports = ConversationModel;