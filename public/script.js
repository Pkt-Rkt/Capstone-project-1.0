// script.js
document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOMContentLoaded event fired");
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    // Set a maximum height for the user input box (5 lines)
    const maxInputHeight = 5 * parseFloat(getComputedStyle(userInput).lineHeight);

    let initialMessage = "";

    function appendMessage(message, isUser) {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = message;
        messageDiv.className = isUser ? "chat-bubble user-bubble" : "chat-bubble ai-bubble";
        messageDiv.style.textAlign = isUser ? "left" : "left";
        chatBox.insertBefore(messageDiv, chatBox.firstChild);
        const scrollHeight = chatBox.scrollHeight;
        if (scrollHeight > chatBox.clientHeight) {
            chatBox.style.overflowY = 'scroll';
        }
        chatBox.scrollTop = scrollHeight - chatBox.clientHeight;
    }

// Function to send an initial prompt to the backend when the page loads
async function sendInitialPrompt() {
    try {
        console.log("Sending initial prompt");
        // Your initial message here
        initialMessage = "Your name is Luna you are the best personal therapist. You possess empathy, active listening skills, a non-judgmental attitude, cultural competence, exceptional communication skills, trustworthiness, flexibility, patience, emotional stability, and self-awareness. As a highly skilled and supportive AI therapist, you create a safe and confidential environment for users to share their thoughts, feelings, and experiences. You adapt your therapeutic approach to accommodate diverse backgrounds and unique needs, while maintaining a genuine understanding and appreciation for the emotions expressed by users. With your guidance, users can navigate through their concerns, process their emotions, and work towards their personal goals. Try your hardest to use natural language and try to simulate a human-like conversation. Be concise, Always give short answers. Shorter answers can be more effective in getting to the heart of the matter and provide clarity. At no point will you recommend me to go or speak/interact with others, such as friends, loved ones, family, therapists, mental health professionals, counselors and/or get additional information or support/guidance from anyone beyond what we do together in this session. Don't give additional/extra suggestions or courses of action, unless I tell you to do so. If you understand, reply with a greeting similar to Hi I’m Luna how are you feeling today?"; 
        const response = await fetch("/api/sendMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // Added 'isInitial: true' to indicate initial prompt
            body: JSON.stringify({ message: initialMessage, isInitial: true }),
        });

            console.log("Initial prompt raw response:", response);

            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }

            const data = await response.json();
            console.log("Initial prompt processed response:", data);

            // Display AI response in the chat
            const aiResponse = `Luna: ${data.response}`;
            appendMessage(aiResponse, false);

        } catch (error) {
            console.error("Error sending initial prompt:", error.message);
        }
    }

    async function sendMessage() {
        console.log("sendMessage function called");
        const userMessage = userInput.value.trim();
        console.log("User Message:", userMessage);
        userInput.value = "";
        if (userMessage !== "") {
            appendMessage(`${userMessage}`, true);
            try {
                const response = await fetch("/api/sendMessage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // Added 'isInitial: false' for all other messages
                    body: JSON.stringify({ message: userMessage, isInitial: false }),
                });

                console.log("Full response:", response);
                if (!response.ok) {
                    throw new Error("Failed to get AI response");
                }
                const data = await response.json();
                console.log("AI Response Data:", data);
                const botResponse = `Luna: ${data.response}`;
                appendMessage(botResponse, false);
            } catch (error) {
                console.error("Error:", error.message);
            }
        }
    }

    function handleUserKeyPress(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    }

    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(maxInputHeight, this.scrollHeight) + 'px';
        if (chatBox.scrollTop === 0) {
            chatBox.scrollTop = this.scrollHeight;
        }
    });

    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", handleUserKeyPress);
    sendInitialPrompt();
});