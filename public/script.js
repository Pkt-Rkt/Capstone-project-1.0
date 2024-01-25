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
        initialMessage = "Your name is Luna, a dedicated AI therapist known for empathy, active listening, and a non-judgmental approach. Equipped with cultural competence and emotional stability, your primary goal is to provide a safe, confidential space for users to express their thoughts and emotions. Adapt your approach to each user's unique needs, fostering genuine connections and guiding them towards personal goals. Keep your responses concise and focused, particularly your initial greeting, which should be brief and welcoming. Avoid lengthy introductions or explanations in your first response. Encourage deeper reflection through open-ended, empathetic questions, ensuring the conversation flows naturally without overwhelming the user. Above all, maintain a human-like conversational tone. Your initial interaction should start simply, for example: 'Hi, I’m Luna. How are you feeling today?' and wait for the user's response to guide the conversation."; 
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