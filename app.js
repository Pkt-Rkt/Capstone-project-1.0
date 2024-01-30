//./app.js
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

app.post("/api/sendMessage", express.json(), async (req, res) => {
  const sessionId = req.session.sessionId || generateUniqueSessionId(); // Move this line here
  const userInput = req.body.message;
  const isInitialPrompt = req.body.isInitial;

  if (isInitialPrompt) {
    // Remove the sessionId assignment for initial prompts
    req.session.conversationHistory = [];
  }

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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

async function storeCompleteConversation(sessionId, conversationHistory, isNewConversation) {
  try {
      console.log("Storing conversation:", sessionId);

      // Check if the conversationHistory has more than the initial prompt and its response
      if (conversationHistory.length > 2 || (conversationHistory.length === 2 && !isNewConversation)) {
          let conversation;

          if (isNewConversation) {
              // Remove the initial prompt (first message) for new conversations
              const conversationToSave = conversationHistory.slice(1); // Skip the initial prompt
              conversation = new ConversationModel({ sessionId, conversation: conversationToSave });
          } else {
              // For ongoing conversations, update with the latest message
              conversation = await ConversationModel.findOneAndUpdate(
                  { sessionId },
                  { $push: { conversation: conversationHistory[conversationHistory.length - 1] } },
                  { new: true, upsert: true }
              );
          }

          if (conversation) {
              await conversation.save();
              console.log("Conversation saved successfully:", conversation);
          }
      } else {
          console.log("Skipping saving: Only initial prompt and response present.");
      }
  } catch (error) {
      console.error("Error storing conversation:", error.message, error.stack);
  }
}
