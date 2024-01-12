// models/conversationModel.js
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  sessionId: String,
  conversation: [{
    userMessage: String,
    botResponse: String,
  }],
  timestamp: { type: Date, default: Date.now }
});

const ConversationModel = mongoose.model("Conversations", conversationSchema);

module.exports = ConversationModel;