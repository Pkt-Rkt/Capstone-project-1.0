// models/aiModel.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

class AIModel {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(input) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContentStream([input]);

      let response = '';
      for await (const chunk of result.stream) {
        response += chunk.text();
      }

      return { response }; // Wrap the response in an object
    } catch (error) {
      console.error("Error generating AI response:", error.message);
      throw error;
    }
  }
}

module.exports = AIModel;
