// public/aiModel.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

function generateUniqueSessionId() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 7);
  return `${timestamp}-${randomString}`;
}

class AIModel {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(input, conversationHistory, sessionId) {
    try {
      let isNewSession = false;
      if (!sessionId) {
        sessionId = generateUniqueSessionId();
        isNewSession = true;
      }

      // Combine conversation history with the current input
      const combinedInput = conversationHistory + '\n' + input;

      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContentStream([combinedInput]);

      let response = "";
      for await (const chunk of result.stream) {
        response += chunk.text();
      }

      return { response };
    } catch (error) {
      console.error("Error generating AI response:", error.message);
      throw error;
    }
  }
}

module.exports = AIModel;