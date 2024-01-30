document.addEventListener("DOMContentLoaded", function () {
    const historyList = document.getElementById("historyList");

    async function fetchConversations() {
        try {
            const response = await fetch("/api/getConversations");
            if (!response.ok) {
                throw new Error("Failed to fetch conversations");
            }
            const conversations = await response.json();
            displayConversations(conversations);
        } catch (error) {
            console.error("Error fetching conversations:", error.message);
        }
    }

    function displayConversations(conversations) {
        conversations.forEach(convo => {
            const convoElement = document.createElement("a");
            convoElement.href = `index.html?sessionId=${convo.sessionId}`; // Pass the session ID as a query parameter
            convoElement.classList.add("list-group-item", "list-group-item-action");
            convoElement.textContent = `Session: ${convo.sessionId} - Messages: ${convo.conversation.length}`;
            historyList.appendChild(convoElement);
        });
    }    

    fetchConversations();
});
