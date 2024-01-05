document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded event fired");
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    function appendMessage(message, isUser) {
        const messageDiv = document.createElement("div");
        messageDiv.className = isUser ? "user-message" : "bot-message";
        messageDiv.textContent = message;
        chatBox.insertBefore(messageDiv, chatBox.firstChild);
        chatBox.scrollTop = 0;
    }

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (userMessage !== "") {
            appendMessage(`You: ${userMessage}`, true);

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
                appendMessage(botResponse, false);
            } catch (error) {
                console.error("Error:", error.message);
            }

            userInput.value = "";
        }
    }

    sendButton.addEventListener("click", sendMessage);
});
