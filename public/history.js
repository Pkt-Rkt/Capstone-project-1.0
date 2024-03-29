// When the document is loaded, fetch conversations
document.addEventListener("DOMContentLoaded", function () {
    fetchConversations();

    // Fetch conversations from the server
    async function fetchConversations() {
        try {
            const response = await fetch("/api/getConversations");
            if (!response.ok) {
                throw new Error("Failed to fetch conversations");
            }
            const conversations = await response.json();
            // Sort conversations by timestamp
            const sortedConversations = conversations.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            displayConversations(sortedConversations);
        } catch (error) {
            console.error("Error fetching conversations:", error.message);
        }
    }

    // Display conversations on the page
    function displayConversations(conversations) {
        conversations.forEach(convo => {
            if (convo.conversation && convo.conversation.length > 1 && convo.timestamp) {
                const firstMessageToShow = convo.conversation[1].userMessage;
                const titleContext = firstMessageToShow.length > 50 ? `${firstMessageToShow.substring(0, 47)}...` : firstMessageToShow;
                const timestamp = new Date(convo.timestamp);
                const formattedDate = timestamp.toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
    
                // Create conversation element
                const convoElement = document.createElement("div");
                convoElement.classList.add("d-flex", "justify-content-between", "align-items-center", "list-group-item", "list-group-item-action");
    
                // Create link for conversation
                const convoLink = document.createElement("a");
                convoLink.href = `index.html?sessionId=${convo.sessionId}`;
                convoLink.textContent = `"${titleContext}" - ${formattedDate}`;
                convoLink.addEventListener("click", async (event) => {
                    event.preventDefault();
                    await updateSessionIdOnServer(convo.sessionId);
                    window.location.href = convoLink.href;
                });
                convoElement.appendChild(convoLink);
    
                // Create delete button for conversation
                const deleteButton = document.createElement("img");
                deleteButton.src = "./img/delete.svg";
                deleteButton.alt = "Delete";
                deleteButton.classList.add("delete-button");
                deleteButton.addEventListener("click", async (event) => {
                    event.stopPropagation();
                    try {
                        const deleteResponse = await fetch(`/api/deleteConversation?sessionId=${convo.sessionId}`, {
                            method: "DELETE"
                        });
                        if (!deleteResponse.ok) {
                            throw new Error("Failed to delete conversation");
                        }
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
    
    // Update the session ID on the server
    async function updateSessionIdOnServer(sessionId) {
        try {
            const response = await fetch("/api/setSessionId", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            });
            if (!response.ok) {
                throw new Error("Failed to update session ID on the server");
            }
            console.log("Session ID updated on server successfully");
        } catch (error) {
            console.error("Error updating session ID on server:", error.message);
        }
    }
});