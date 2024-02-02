// Import required modules and initialize Express app
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const AIModel = require("./models/aiModel");
const ConversationModel = require("./models/conversationModel");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;
const loginRoutes = require("./routes/loginRoutes");
const signupRoutes = require("./routes/signupRoutes");
const bodyparser = require('body-parser');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// Database connection
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware for parsing request bodies and managing sessions
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: true,
  // Use in-memory storage for sessions
  store: new (require("express-session").MemoryStore)(),
}));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

const apiKey = process.env.API_KEY;
const model = new AIModel(apiKey);

// Generate a unique session ID for each conversation
function generateUniqueSessionId() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 7);
  return `${timestamp}-${randomString}`;
}

// Use route handlers
app.use("/", loginRoutes);
app.use("/", signupRoutes);

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    // User is authenticated
    next();
  } 
}

// Route for the default landing page
app.get("/", (req, res) => {
  if (req.session.user) {
    // User is authenticated, redirect to /index.html
    res.redirect("/index.html");
  } 
});

// Serve login.html as the default landing page
app.get("/login", (req, res) => {
  // Check if the user is already authenticated and redirect accordingly
  if (req.session.user) {
    // User is authenticated, redirect to a protected page
    res.redirect("/index.html");
  } else {
    // User is not authenticated, serve login.html from the public folder
    res.sendFile(path.join(__dirname, "public", "login.html"));
  }
});

// Route for logging out
app.get("/logout", (req, res) => {
  req.session.user = undefined;
  res.redirect("/login");
});

// Route for sending messages to A
app.post("/api/sendMessage", express.json(), async (req, res) => {
  const { message, isInitial, sessionId: sessionIdFromClient } = req.body;

  // Determine if this is a new conversation based on the 'isInitial' flag
  if (isInitial) {
    // Reset the conversation history for a new conversation
    req.session.conversationHistory = [];
    // Generate new or use existing sessionId
    req.session.sessionId = sessionIdFromClient || generateUniqueSessionId();
  }

  const sessionId = req.session.sessionId;
  const userInput = message;

  try {
    const conversationHistory = req.session.conversationHistory || [];
    const context = conversationHistory.map(conv => `${conv.userMessage}\n${conv.botResponse}`).join("\n");

    // Check if the user is authenticated
    if (!req.session.user) {
      // User is not authenticated (guest user), retain the current conversation temporarily in the session
      const aiResponse = await model.generateResponse(userInput, context, sessionId);
      conversationHistory.push({ userMessage: userInput, botResponse: aiResponse.response });
      req.session.conversationHistory = conversationHistory;
      res.json({ response: aiResponse.response });
    } else {
      // User is authenticated, proceed with saving the conversation
      const aiResponse = await model.generateResponse(userInput, context, sessionId);

      // Update conversation history in session
      conversationHistory.push({ userMessage: userInput, botResponse: aiResponse.response });
      req.session.conversationHistory = conversationHistory;

      // Log the session user for debugging
      console.log(req.session.user);

      // Proceed with storing the conversation
      await storeCompleteConversation(req, sessionId, conversationHistory, isInitial);

      res.json({ response: aiResponse.response });
    }
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for fetching conversation history
app.get("/api/getConversations", async (req, res) => {
  // Fetch and return all conversations for the authenticated user
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.session.user.id;

  try {
    const conversations = await ConversationModel.find({ userId }, 'sessionId conversation timestamp').lean();
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for fetching a specific conversation
app.get("/api/getConversation", async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
  }

  try {
      const conversation = await ConversationModel.findOne({ sessionId });
      if (!conversation) {
          return res.status(404).json({ error: "Conversation not found" });
      }

      // Set the conversation history in the session storage
      req.session.conversationHistory = conversation.conversation.map(item => ({
          userMessage: item.userMessage,
          botResponse: item.botResponse
      }));

      // Return the conversation history
      res.json(conversation.conversation);
  } catch (error) {
      console.error("Error fetching conversation:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// Route for deleting a conversation
app.delete("/api/deleteConversation", async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    // Delete a specific conversation based on session ID
    const deletedConversation = await ConversationModel.findOneAndDelete({ sessionId });

    if (!deletedConversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    console.log("Conversation deleted successfully:", deletedConversation);
    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for fetching conversation history
async function storeCompleteConversation(req, sessionId, conversationHistory, isNewConversation) {
  try {
    // Get the user ID from the session
    const userId = req.session.user.id;
    console.log("Storing conversation:", sessionId);

    // Check if conversationHistory is empty
    if (conversationHistory.length === 0) {
      console.log("Conversation is empty, not saving.");
      return;
    }

    // Find the existing conversation or create a new one
    let conversation = await ConversationModel.findOne({ sessionId, userId });

    if (!conversation) {
      conversation = new ConversationModel({
        userId,
        sessionId,
        conversation: [],
      });
    }

    // Define the starting index for merging based on isNewConversation
    const startIndex = isNewConversation ? 1 : 0;

    // Merge the existing conversation with the new conversationHistory
    const mergedConversation = [
      ...conversation.conversation,
      ...conversationHistory.slice(startIndex)
    ];

    // Remove duplicates based on userMessage and botResponse
    const uniqueConversation = [];
    const uniqueMessages = new Set();

    for (const message of mergedConversation) {
      const messageKey = `${message.userMessage}${message.botResponse}`;
      if (!uniqueMessages.has(messageKey)) {
        uniqueMessages.add(messageKey);
        uniqueConversation.push(message);
      }
    }

    // Check if the conversation is empty after removing duplicates
    if (uniqueConversation.length === 0) {
      console.log("Conversation is empty, not saving.");
      return;
    }

    // Update the conversation with the unique messages
    conversation.conversation = uniqueConversation;

    await conversation.save();
    console.log("Conversation saved/updated successfully:", conversation);
  } catch (error) {
    console.error("Error storing conversation:", error.message, error.stack);
  }
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});