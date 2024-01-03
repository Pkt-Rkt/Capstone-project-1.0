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
      const response = await this.model.generateResponse(input);
      this.view.displayResponse(response);
      this.view.promptUser();
    });
  }
}

module.exports = ChatController;
