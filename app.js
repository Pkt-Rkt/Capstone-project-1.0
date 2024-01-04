const express = require("express");
const path = require("path");
const AIModel = require("./models/aiModel");
const ConsoleView = require("./views/consoleView");
const ChatController = require("./controllers/chatController");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Use the PORT specified in the .env file or default to 3000

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Set up AI model, view, and controller
const apiKey = process.env.API_KEY;
const model = new AIModel(apiKey);
const view = new ConsoleView();
const controller = new ChatController(model, view);

// Set up a simple route to handle incoming messages from the frontend
app.post("/api/sendMessage", express.json(), async (req, res) => {
    const userInput = req.body.message;
  
    try {
      // Use the AI model to generate a response
      const aiResponse = await model.generateResponse(userInput);
  
      // Send the AI response back to the frontend
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Error generating AI response:", error.message);
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
