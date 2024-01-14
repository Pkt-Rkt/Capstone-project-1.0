//controllers/chatController.js
const readline = require("readline");
const AIModel = require("../models/aiModel");
const ConsoleView = require("../views/consoleView");

class ChatController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.userInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.userInterface.prompt();

    this.userInterface.on("line", async (input) => {
      // Using a fixed sessionId for console interactions
      const sessionId = "console-session-1";
      const response = await this.model.generateResponse(input, sessionId);
      this.view.displayResponse(response);
      this.view.promptUser();
    });
  }
}

module.exports = ChatController;
