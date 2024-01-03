const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

class AIModel {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(input) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContentStream([input]);

    let response = '';
    for await (const chunk of result.stream) {
      response += chunk.text();
    }

    return response;
  }
}

module.exports = AIModel;
