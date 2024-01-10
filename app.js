// app.js
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const AIModel = require("./models/aiModel");
const ConsoleView = require("./views/consoleView");
const ChatController = require("./controllers/chatController");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/Luna');

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
    // Use the AI model to generate a response, passing the session context
    const aiResponse = await model.generateResponse(userInput, req.session.context);

    // Update the session context with the latest information
    req.session.context = aiResponse.sessionContext;

    // Send the AI response back to the frontend
    res.json({ response: aiResponse.response });
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Test MongoDB connection route
app.get("/testDBConnection", async (req, res) => {
  try {
    // Assuming you have a model/schema for your data
    const SessionModel = mongoose.model("Session", {
      message: String,
    });

    // Example: Insert a document into the "sessions" collection
    const newSession = new SessionModel({ message: "hello" });
    await newSession.save();

    // Example: Query the database to find the inserted document
    const result = await SessionModel.findOne({ message: "hello" });

    if (result) {
      res.json({ message: "MongoDB connection is successful!", data: result });
    } else {
      res.json({ message: "No data found in the database." });
    }
  } catch (error) {
    console.error("Error testing MongoDB connection:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});