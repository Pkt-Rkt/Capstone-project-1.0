const AIModel = require("./models/aiModel");
const ConsoleView = require("./views/consoleView");
const ChatController = require("./controllers/chatController");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.API_KEY;

const model = new AIModel(apiKey);
const view = new ConsoleView();
const controller = new ChatController(model, view);
