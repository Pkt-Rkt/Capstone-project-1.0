document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded event fired");
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    function appendMessage(message, isUser) {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = message;

        // Add chat bubble styles
        messageDiv.className = isUser ? "chat-bubble user-bubble" : "chat-bubble ai-bubble";

        // Align user messages to the right and AI messages to the left
        messageDiv.style.textAlign = isUser ? "left" : "left";

        chatBox.insertBefore(messageDiv, chatBox.firstChild);
        chatBox.scrollTop = 0;
    }

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        userInput.value = ""; // Clear the user input immediately
    
        if (userMessage !== "") {
            appendMessage(`${userMessage}`, true); // Set the 'isUser' parameter to true for user messages
    
            try {
                const response = await fetch("/api/sendMessage", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message: userMessage }),
                });
    
                if (!response.ok) {
                    throw new Error("Failed to get AI response");
                }
    
                const data = await response.json();
                const botResponse = `Luna: ${data.response}`;
                appendMessage(botResponse, false); // 'isUser' is false for AI responses
            } catch (error) {
                console.error("Error:", error.message);
            }
        }
    }

    function handleUserKeyPress(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    }

    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", handleUserKeyPress);
});
