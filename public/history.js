document.addEventListener("DOMContentLoaded", function () {
    const historyList = document.getElementById("historyList");

    async function fetchConversations() {
        try {
            const response = await fetch("/api/getConversations");
            if (!response.ok) {
                throw new Error("Failed to fetch conversations");
            }
            const conversations = await response.json();
            // Sort conversations by timestamp in ascending order
            const sortedConversations = conversations.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            displayConversations(sortedConversations);
        } catch (error) {
            console.error("Error fetching conversations:", error.message);
        }
    }

    function displayConversations(conversations) {
        conversations.forEach(convo => {
            if (convo.conversation && convo.conversation.length > 0 && convo.timestamp) {
                const firstMessage = convo.conversation[0].userMessage;
                const titleContext = firstMessage.length > 50 ? `${firstMessage.substring(0, 47)}...` : firstMessage;

                const timestamp = new Date(convo.timestamp);
                const formattedDate = timestamp.toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                const convoElement = document.createElement("a");
                convoElement.href = `index.html?sessionId=${convo.sessionId}`;
                convoElement.classList.add("list-group-item", "list-group-item-action");
                convoElement.textContent = `"${titleContext}" - ${formattedDate}`;
                historyList.appendChild(convoElement);
            }
        });
    }

    fetchConversations();
});