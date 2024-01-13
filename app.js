const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const AIModel = require("./models/aiModel");
const ConversationModel = require("./models/conversationModel"); // Import the conversation model
const ConsoleView = require("./views/consoleView");
const ChatController = require("./controllers/chatController");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb"); // Import MongoClient

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const uri = "mongodb://0.0.0.0:27017/Luna"; // Define the MongoDB connection string

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const client = new MongoClient(uri); // Define MongoClient

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    store: new (require("express-session").MemoryStore)(),
  })
);

app.use(express.static(path.join(__dirname, "public")));

const apiKey = process.env.API_KEY;
const model = new AIModel(apiKey);
const view = new ConsoleView();
const controller = new ChatController(model, view);

app.post("/api/sendMessage", express.json(), async (req, res) => {
  const sessionId = req.session.id;
  console.log("SessionId:", sessionId); // Log the sessionId

  const userInput = req.body.message;
  const isInitialPrompt = req.body.isInitial;

  // Retrieve previous messages from session
  const previousMessages = req.session.conversationHistory || [];
  console.log("Conversation history before saving:", previousMessages); // Log for inspection

  console.log("Is Initial Prompt:", isInitialPrompt); // Added for verification

  // Log when the initial prompt is received
  if (isInitialPrompt) {
    console.log("Initial prompt received:", userInput);
  }

  try {
    console.log("Received message from user:", userInput);

    // Retrieve previous messages from session
    const previousMessages = req.session.conversationHistory || [];
    console.log("Conversation history before saving:", previousMessages); // Log for inspection

    // Generate AI response
    const aiResponse = await model.generateResponse(userInput, sessionId);

    // Push new message to conversation array
    previousMessages.push({ userMessage: userInput, botResponse: aiResponse.response });

    // Update session's conversation history
    req.session.conversationHistory = previousMessages;

    // Store the complete conversation in MongoDB
    await storeCompleteConversation(sessionId, previousMessages, isInitialPrompt);

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
    console.log("Finding and updating conversation:", sessionId);

    let conversation;
    if (isNewConversation) {
      // Create a new conversation document
      conversation = new ConversationModel({ sessionId, conversation: conversationHistory });
    } else {
      // Find the existing conversation document
      conversation = await ConversationModel.findOne({ sessionId });
      // Append only the latest message
      const latestMessage = conversationHistory[conversationHistory.length - 1];
      conversation.conversation.push(latestMessage);
    }

    // Save the conversation document
    await conversation.save();
    console.log("Conversation saved successfully:", conversation);
  } catch (error) {
    console.error("Error storing conversation:", error.message, error.stack);
  }
}
