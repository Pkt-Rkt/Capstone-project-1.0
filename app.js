const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const AIModel = require("./models/aiModel");
const ConversationModel = require("./models/conversationModel");
const ConsoleView = require("./views/consoleView");
const ChatController = require("./controllers/chatController");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uri = "mongodb://0.0.0.0:27017/Luna";

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const client = new MongoClient(uri);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: true,
  store: new (require("express-session").MemoryStore)(),
}));

app.use(express.static(path.join(__dirname, "public")));

const apiKey = process.env.API_KEY;
const model = new AIModel(apiKey);
const view = new ConsoleView();
const controller = new ChatController(model, view);

function generateUniqueSessionId() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 7);
  return `${timestamp}-${randomString}`;
}

app.post("/api/sendMessage", express.json(), async (req, res) => {
  let sessionId;
  const userInput = req.body.message;
  const isInitialPrompt = req.body.isInitial;

  if (isInitialPrompt) {
    sessionId = generateUniqueSessionId(); // Generate new session ID for initial prompt
    req.session.sessionId = sessionId; // Update session ID
    req.session.conversationHistory = []; // Reset conversation history
  } else {
    sessionId = req.session.sessionId || generateUniqueSessionId(); // Use existing or new session ID
    req.session.sessionId = sessionId; // Ensure session ID is stored
  }

  try {
    console.log("Received message from user:", userInput);
    const aiResponse = await model.generateResponse(userInput, sessionId);
    req.session.conversationHistory.push({ userMessage: userInput, botResponse: aiResponse.response });
    await storeCompleteConversation(sessionId, req.session.conversationHistory, isInitialPrompt);
    res.json({ response: aiResponse.response });
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

async function storeCompleteConversation(sessionId, conversationHistory, isNewConversation) {
  try {
    console.log("Storing conversation:", sessionId);
    let conversation;
    if (isNewConversation) {
      conversation = new ConversationModel({ sessionId, conversation: conversationHistory });
    } else {
      conversation = await ConversationModel.findOneAndUpdate(
        { sessionId },
        { $push: { conversation: conversationHistory[conversationHistory.length - 1] }},
        { new: true, upsert: true }
      );
    }
    await conversation.save();
    console.log("Conversation saved successfully:", conversation);
  } catch (error) {
    console.error("Error storing conversation:", error.message, error.stack);
  }
}
