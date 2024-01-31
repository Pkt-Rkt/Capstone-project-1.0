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
    
                const convoElement = document.createElement("div");
                convoElement.classList.add("d-flex", "justify-content-between", "align-items-center", "list-group-item", "list-group-item-action");
    
                const convoLink = document.createElement("a");
                convoLink.href = `index.html?sessionId=${convo.sessionId}`;
                convoLink.textContent = `"${titleContext}" - ${formattedDate}`;
                convoElement.appendChild(convoLink);
    
                const deleteButton = document.createElement("img");
                deleteButton.src = "./img/delete.svg"; // Path to your delete.svg image
                deleteButton.alt = "Delete";
                deleteButton.classList.add("delete-button"); // Add a class for styling if needed
                deleteButton.addEventListener("click", async () => {
                    console.log("Delete button clicked"); // Add this line
                    try {
                        // Send a request to delete the conversation by sessionId
                        const deleteResponse = await fetch(`/api/deleteConversation?sessionId=${convo.sessionId}`, {
                            method: "DELETE"
                        });
                        if (!deleteResponse.ok) {
                            throw new Error("Failed to delete conversation");
                        }
                        // Remove the conversation element from the list on successful deletion
                        historyList.removeChild(convoElement);
                    } catch (error) {
                        console.error("Error deleting conversation:", error.message);
                    }
                });
                
convoElement.appendChild(deleteButton);
    
                historyList.appendChild(convoElement);
            }
        });
    }

    fetchConversations();
});