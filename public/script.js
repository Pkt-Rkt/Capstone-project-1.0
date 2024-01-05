document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");

    function appendMessage(message, isUser) {
        const messageDiv = document.createElement("div");
        messageDiv.className = isUser ? "user-message" : "bot-message";
        messageDiv.textContent = message;
        chatBox.insertBefore(messageDiv, chatBox.firstChild); // Insert the new message at the beginning
        chatBox.scrollTop = 0; // Scroll to the top to keep the newest message at the bottom
    }

    async function sendMessage() {
        console.log("sendMessage function is triggered");
        const userMessage = userInput.value.trim();
        if (userMessage !== "") {
            appendMessage(`You: ${userMessage}`, true);

            try {
                // Make an API request to the server for the AI response
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
                const botResponse = `AI Bot: ${data.response}`;
                appendMessage(botResponse, false);
            } catch (error) {
                console.error("Error:", error.message);
            }

            // Clear the user input
            userInput.value = "";
        }
    }

    window.sendMessage = sendMessage;
});
