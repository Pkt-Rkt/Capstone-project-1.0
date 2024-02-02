// Import necessary modules
const readline = require("readline");
const AIModel = require("../models/aiModel");
const ConsoleView = require("../views/consoleView");

// Controller class to manage chat interactions
class ChatController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Setup readline interface for command line interaction
    this.userInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Prompt user for input
    this.userInterface.prompt();

    // Handle line input event
    this.userInterface.on("line", async (input) => {
      const sessionId = "console-session-1";
      const response = await this.model.generateResponse(input, sessionId);
      this.view.displayResponse(response);
      this.view.promptUser();
    });
  }
}

// Export ChatController for use elsewhere
module.exports = ChatController;
