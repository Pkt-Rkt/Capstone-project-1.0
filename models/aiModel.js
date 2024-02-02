// Load necessary modules
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

// Function to create a unique session ID
function generateUniqueSessionId() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 7);
  return `${timestamp}-${randomString}`;
}

// Class to interact with Google's Generative AI
class AIModel {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Function to generate a response from the AI based on input and conversation history
  async generateResponse(input, conversationHistory, sessionId) {
    try {
      let isNewSession = false;
      if (!sessionId) {
        sessionId = generateUniqueSessionId();
        isNewSession = true;
      }

      // Prepare the input for the AI model by combining the conversation history with the current input
      const combinedInput = conversationHistory + '\n' + input;

      // Select the AI model to use
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      // Generate response from the AI model
      const result = await model.generateContentStream([combinedInput]);

      let response = ""; // Initialize response string
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

// Export AIModel class for use in other parts of the application
module.exports = AIModel;