const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

class TherapistController {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.API_KEY);
  }

  async getTherapistResponse(input) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContentStream([input]);

    let therapistResponse = "";
    for await (const chunk of result.stream) {
      therapistResponse += chunk.text();
    }

    return therapistResponse;
  }
}

module.exports = TherapistController;
