document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded event fired");
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    // Set a maximum height for the user input box (5 lines)
    const maxInputHeight = 5 * parseFloat(getComputedStyle(userInput).lineHeight);
    function appendMessage(message, isUser) {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = message;
    
        // Add chat bubble styles
        messageDiv.className = isUser ? "chat-bubble user-bubble" : "chat-bubble ai-bubble";
    
        // Align user messages and AI messages both align to the left
        messageDiv.style.textAlign = isUser ? "left" : "left";
    
        // Add the message to the chat box
        chatBox.insertBefore(messageDiv, chatBox.firstChild);
    
        // Adjust scrollTop based on the actual height of the chatBox and the newly added message
        const scrollHeight = chatBox.scrollHeight;
    
        // If the chat box exceeds its height, enable scrolling
        if (scrollHeight > chatBox.clientHeight) {
            chatBox.style.overflowY = 'scroll';
        }
    
        // Scroll to the bottom to show the latest message
        chatBox.scrollTop = scrollHeight - chatBox.clientHeight;
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
            event.preventDefault(); // Prevent the default behavior (creating a new line)
            sendMessage();
        }
    }

    userInput.addEventListener('input', function () {
        // Set the height to auto to adjust the input field dynamically
        this.style.height = 'auto';
        // Set a maximum height for the user input box
        this.style.height = Math.min(maxInputHeight, this.scrollHeight) + 'px';

        // Only set scrollTop if the user didn't scroll the chat box
        if (chatBox.scrollTop === 0) {
            chatBox.scrollTop = this.scrollHeight;
        }
    });

    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", handleUserKeyPress);
});
