// frontend.js
function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    const chatLog = document.getElementById('chat-log');
    
    // Display user's message
    chatLog.innerHTML += `<p>User: ${userInput}</p>`;

    // Send user's message to the server (backend)
    fetch('/api/sendMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
    })
    .then(response => response.json())
    .then(data => {
        // Display bot's response
        chatLog.innerHTML += `<p>Luna: ${data.message}</p>`;
    })
    .catch(error => console.error('Error:', error));

    // Clear the input field
    document.getElementById('user-input').value = '';
}
