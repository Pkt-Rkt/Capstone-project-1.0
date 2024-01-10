// models/conversationModel.js
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userMessage: String,
  botResponse: String,
});

const ConversationModel = mongoose.model("Conversation", conversationSchema);

module.exports = ConversationModel;
