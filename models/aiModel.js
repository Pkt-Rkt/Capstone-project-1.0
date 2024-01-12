const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const ConversationModel = require("./conversationModel");
dotenv.config();

class AIModel {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(input, sessionId) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContentStream([input]);

      let response = "";
      for await (const chunk of result.stream) {
        response += chunk.text();
      }

      // Fetch previous messages from the database for the session
      const previousMessages = await this.getPreviousMessages(sessionId);

      // Placeholder for session context, replace this with actual data
      const sessionContext = {
        previousMessages,
        // Include relevant data for maintaining conversation context
        someKey: "someValue",
      };

      return { response, sessionContext };
    } catch (error) {
      console.error("Error generating AI response:", error.message);
      throw error;
    }
  }

  async getPreviousMessages(sessionId) {
    try {
      const messages = await ConversationModel.find({ sessionId });

      console.log("Fetched previous messages:", messages);

      return messages.map((message) => ({
        userMessage: message.userMessage,
        botResponse: message.botResponse,
      }));
    } catch (error) {
      console.error("Error fetching previous messages:", error.message);
      throw error;
    }
  }
}

module.exports = AIModel;
