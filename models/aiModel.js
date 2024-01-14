//public/aiModel.js
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

  async generateResponse(input, sessionId) {
    try {
      let isNewSession = false;
      if (!sessionId) {
        sessionId = generateUniqueSessionId();
        isNewSession = true;
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContentStream([input]);

      let response = "";
      for await (const chunk of result.stream) {
        response += chunk.text();
      }

      // Placeholder for session context, replace this with actual data
      const sessionContext = {
        // Include relevant data for maintaining conversation context
        someKey: "someValue",
      };

      return { response, sessionContext };
    } catch (error) {
      console.error("Error generating AI response:", error.message);
      throw error;
    }
  }
}

module.exports = AIModel;
