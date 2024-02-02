document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOMContentLoaded event fired");
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
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

    async function sendInitialPrompt() {
        try {
            const userMessage = "Your name is Luna, a dedicated AI therapist known for empathy, active listening, and a non-judgmental approach. Equipped with cultural competence and emotional stability, your primary goal is to provide a safe, confidential space for users to express their thoughts and emotions. Adapt your approach to each user's unique needs, fostering genuine connections and guiding them towards personal goals. Keep your responses concise and focused, particularly your initial greeting, which should be brief and welcoming. Avoid lengthy introductions or explanations in your first response. Encourage deeper reflection through open-ended, empathetic questions, ensuring the conversation flows naturally without overwhelming the user. Above all, maintain a human-like conversational tone. Your initial interaction should start simply say 'Hi, I’m Luna. How are you feeling today?' and wait for the user's response to guide the conversation.";
    
            const response = await fetch("/api/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    isInitial: true, // Mark as the initial message
                    sessionId: null // Explicitly set to null for new conversations
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }
    
            const data = await response.json();
            const botResponse = `Luna: ${data.response}`;
            appendMessage(botResponse, false); // Display only Luna's response to the initial prompt
        } catch (error) {
            console.error("Error sending initial prompt:", error.message);
        }
    }
    

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        userInput.value = "";
        if (userMessage !== "") {
            appendMessage(userMessage, true);
    
            try {
                const response = await fetch("/api/sendMessage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: userMessage,
                        isInitial: false,
                        sessionId: window.sessionId 
                    }),
                });
    
                if (!response.ok) {
                    throw new Error("Failed to get AI response");
                }
    
                const data = await response.json();
                const botResponse = `Luna: ${data.response}`;
                appendMessage(botResponse, false); // Display Luna's response
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
    });

    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", handleUserKeyPress);

    // New function to get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

// Load and display the conversation history
async function loadConversation(sessionId) {
    try {
        const response = await fetch(`/api/getConversation?sessionId=${sessionId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch conversation");
        }
        const conversation = await response.json();

        conversation.forEach(item => {
            appendMessage(item.userMessage, true);
            appendMessage(item.botResponse, false);
        });

        // Update the session ID for subsequent messages
        window.sessionId = sessionId;
    } catch (error) {
        console.error("Error fetching conversation:", error.message);
    }
}

    

    // Check for a session ID in the URL
    const sessionId = getUrlParameter('sessionId');
    if (sessionId) {
        await loadConversation(sessionId);
    } else {
        // If no session ID, proceed with initial prompt
        sendInitialPrompt();
    }
});