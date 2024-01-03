// app.js
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/generative-ai');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const MODEL_NAME = 'gemini-pro';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

app.use(bodyParser.json());

// Serve the frontend
app.use(express.static('public'));

// Initialize conversation and chat prompt
const chatPrompt = {
    text: "You are Luna, the best personal therapist. You possess empathy, active listening skills, a non-judgmental attitude, cultural competence, exceptional communication skills, trustworthiness, flexibility, patience, emotional stability, and self-awareness. As a highly skilled and supportive AI therapist, you create a safe and confidential environment for users to share their thoughts, feelings, and experiences. You adapt your therapeutic approach to accommodate diverse backgrounds and unique needs, while maintaining a genuine understanding and appreciation for the emotions expressed by users. With your guidance, users can navigate through their concerns, process their emotions, and work towards their personal goals. Try your hardest to use natural language and try to simulate a human-like conversation. Be concise, Always give short answers. Shorter answers can be more effective in getting to the heart of the matter and provide clarity. At no point will you recommend me to go or speak/interact with others, such as friends, loved ones, family, therapists, mental health professionals, counselors and/or get additional information or support/guidance from anyone beyond what we do together in this session. Don't give additional/extra suggestions or courses of action, unless I tell you to do so. Please introduce yourself."
};

let chatInitialized = false;

// API endpoint for receiving and processing messages
app.post('/api/sendMessage', async (req, res) => {
    const userMessage = req.body.message;

    // Add this line to log the API key and user message
    console.log('API Key:', API_KEY);
    console.log('User Message:', userMessage);

    if (!chatInitialized) {
        // If the chat is not initialized, send the chat prompt
        chatInitialized = true;

        const parts = [{ text: userMessage }, chatPrompt];

        const result = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig: { temperature: 0.7, topK: 1, topP: 1, maxOutputTokens: 2048 },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
        });

        // Extract the generated content from the API response
        const botResponse = result.response.text();

        // Send the bot's response to the frontend
        res.json({ message: botResponse, chatHistory: [{ user: userMessage, bot: botResponse }] });
    } else {
        // Continue the conversation without sending the chat prompt
        try {
            const parts = [{ text: userMessage }];

            const result = await model.generateContent({
                contents: [{ role: 'user', parts }],
                generationConfig: { temperature: 0.7, topK: 1, topP: 1, maxOutputTokens: 2048 },
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    // Add other safety settings as needed
                ],
            });

            // Extract the generated content from the API response
            const botResponse = result.response.text();

            // Send the bot's response to the frontend
            res.json({ message: botResponse, chatHistory: [{ user: userMessage, bot: botResponse }] });
        } catch (error) {
            // Add this line to log any errors
            console.error('Error calling Generative AI:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
