// ./app.js
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
const uri = process.env.MONGODB_URI || "mongodb://0.0.0.0:27017/Luna";
const loginRoutes = require("./routes/loginRoutes");
const signupRoutes = require("./routes/signupRoutes");

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: true,
  store: new (require("express-session").MemoryStore)(),
}));

app.use(express.static(path.join(__dirname, "public")));

const apiKey = process.env.API_KEY;
const model = new AIModel(apiKey);

function generateUniqueSessionId() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 7);
  return `${timestamp}-${randomString}`;
}

// Include login and signup routes before serving login.html
app.use("/", loginRoutes);
app.use("/", signupRoutes);

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated, redirect to login page
    res.redirect("/login");
  }
}

// Serve login.html as the default landing page for unauthenticated users
app.get("/", (req, res) => {
  if (req.session.user) {
    // User is authenticated, redirect to /index.html
    res.redirect("/index.html");
  } else {
    // User is not authenticated, serve login.html
    res.sendFile(path.join(__dirname, "public", "login.html"));
  }
});

// Protected routes
app.get("/index.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/history.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "history.html"));
});

app.get("/profile.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

// Serve login.html as the default landing page
app.get("/login", (req, res) => {
  // Check if the user is already authenticated and redirect accordingly
  if (req.session.user) {
    // User is authenticated, redirect to a protected page
    res.redirect("/history.html");
  } else {
    // User is not authenticated, serve login.html
    res.sendFile(path.join(__dirname, "public", "login.html"));
  }
});

// Login route
app.post("/login", (req, res) => {
  // Check credentials and authenticate user
  // Replace this with your authentication logic
  if (req.body.username === "your_username" && req.body.password === "your_password") {
    req.session.user = req.body.username; // Set user session
    res.redirect("/history.html"); // Redirect to a protected page after login
  } else {
    res.status(401).send("Authentication failed"); // Authentication failed
  }
});

// Logout route
app.get("/logout", (req, res) => {
  // Clear user session to log out
  req.session.user = undefined;
  res.redirect("/login"); // Redirect to login page after logout
});

app.post("/api/sendMessage", express.json(), async (req, res) => {
  const isInitialPrompt = req.body.isInitial;

  if (isInitialPrompt) {
    // Generate a new session ID for initial prompts and clear existing conversation history
    req.session.sessionId = generateUniqueSessionId();
    req.session.conversationHistory = [];
  }

  const sessionId = req.session.sessionId;
  const userInput = req.body.message;

  try {
    const conversationHistory = req.session.conversationHistory.map(
      (conv) => `${conv.userMessage}\n${conv.botResponse}`
    ).join("\n");
    const aiResponse = await model.generateResponse(userInput, conversationHistory, sessionId);
    req.session.conversationHistory.push({ userMessage: userInput, botResponse: aiResponse.response });
    await storeCompleteConversation(sessionId, req.session.conversationHistory, isInitialPrompt);
    res.json({ response: aiResponse.response });
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/getConversations", async (req, res) => {
  try {
    const conversations = await ConversationModel.find({}, 'sessionId conversation timestamp').lean();
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
        res.json(conversation.conversation); // Adjust if your data structure is different
    } catch (error) {
        console.error("Error fetching conversation:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete conversation route
app.delete("/api/deleteConversation", async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    // Find and delete the conversation with the given sessionId
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

async function storeCompleteConversation(sessionId, conversationHistory, isNewConversation) {
  try {
    console.log("Storing conversation:", sessionId);

    // Check if conversationHistory is empty
    if (conversationHistory.length === 0) {
      console.log("Conversation is empty, not saving.");
      return;
    }

    // Find the existing conversation or create a new one
    let conversation = await ConversationModel.findOne({ sessionId });

    if (!conversation) {
      conversation = new ConversationModel({
        sessionId,
        conversation: [],
      });
    }

    // Define the starting index for merging based on isNewConversation
    const startIndex = isNewConversation ? 1 : 0; // Changed from 2 to 1 to skip the initial message

    // Merge the existing conversation with the new conversationHistory (starting from the defined index)
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
