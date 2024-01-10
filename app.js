// app.js
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const AIModel = require("./models/aiModel");
const ConversationModel = require("./models/conversationModel"); // Import the conversation model
const ConsoleView = require("./views/consoleView");
const ChatController = require("./controllers/chatController");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/Luna')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const db = mongoose.connection;

// Handle MongoDB connection error
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Set up express-session and mongoose for session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    store: new (require("express-session").MemoryStore)(), // Use MemoryStore for simplicity
  })
);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Set up AI model, view, and controller
const apiKey = process.env.API_KEY;
const model = new AIModel(apiKey);
const view = new ConsoleView();
const controller = new ChatController(model, view);

// Set up a simple route to handle incoming messages from the frontend
app.post("/api/sendMessage", express.json(), async (req, res) => {
  const sessionId = req.session.id;
  const userInput = req.body.message;

  try {
    console.log("Received message from user:", userInput);

    // Get previous messages from the session context
    const previousMessages = req.session.previousMessages || [];

    // Use the AI model to generate a response, passing the session context
    const aiResponse = await model.generateResponse(userInput, previousMessages);

    // Update the session context with the latest information
    req.session.previousMessages = [...previousMessages, { userMessage: userInput, botResponse: aiResponse.response }];

    // Store the conversation in the database
    await storeConversation(sessionId, userInput, aiResponse.response);

    // Send the AI response back to the frontend
    res.json({ response: aiResponse.response });
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Define the /api/storeConversation route
app.post("/api/storeConversation", express.json(), async (req, res) => {
  const sessionId = req.session.id;
  const userMessage = req.body.userMessage;
  const botResponse = req.body.botResponse;

  try {
    // Store the conversation in the database
    await storeConversation(sessionId, userMessage, botResponse);

    res.sendStatus(200); // Respond with success status
  } catch (error) {
    console.error("Error storing conversation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Store conversation in the database
async function storeConversation(sessionId, userMessage, botResponse) {
  try {
    const conversation = new ConversationModel({
      sessionId,
      userMessage,
      botResponse,
    });
    await conversation.save();
  } catch (error) {
    console.error("Error storing conversation:", error.message);
    throw error;
  }
}
