/*
File: meeting-room.js
Purpose: Handles WebSocket communication for the meeting room.

Flow:
- Connects to the WebSocket endpoint (/ws/{room_id}) in main.py.
- Sends and receives messages in real-time.
*/

let socket;
let nickname;

function setNickname() {
    const nicknameInput = document.getElementById("nickname-input");
    nickname = nicknameInput.value.trim();

    if (!nickname) {
        alert("Please enter a nickname.");
        return;
    }

    document.getElementById("nickname-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";

    connectToRoom();
}

function connectToRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    let roomId = urlParams.get("room_id") || "general"; // Default to "general" if no room ID is provided

    document.getElementById("room-info").innerText = `You are in room: ${roomId}`;
    socket = new WebSocket(`ws://127.0.0.1:8000/ws/${roomId}`);

    socket.onopen = () => {
        socket.send(nickname);
        const messages = document.getElementById("messages");
        const messageElement = document.createElement("div");
        messageElement.className = "system-message";
        messageElement.style.textAlign = "center"; // Center-align the message
        messageElement.innerText = "Connected to the room.";
        messages.appendChild(messageElement); // Ensure the message is appended to the chatbox
        messages.scrollTop = messages.scrollHeight; // Scroll to the latest message
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const messages = document.getElementById("messages");
        const messageElement = document.createElement("div");

        if (data.type === "message") {
            // Only append messages from other users or AI
            if (!data.isAI && data.nickname === nickname) return;

            messageElement.className = data.isAI ? "message ai-message" : "message";
            const senderSpan = document.createElement("span");
            senderSpan.style.color = data.color;
            senderSpan.style.fontWeight = "bold";
            senderSpan.innerText = data.nickname;

            const messageSpan = document.createElement("span");
            messageSpan.innerText = `: ${data.message}`;

            messageElement.appendChild(senderSpan);
            messageElement.appendChild(messageSpan);
        } else if (data.type === "join" || data.type === "leave") {
            if (data.nickname === nickname && data.type === "join") return; // Prevent duplicate join message for the current user
            messageElement.className = "system-message";
            messageElement.style.textAlign = "center"; // Center-align the message
            messageElement.innerText = data.type === "join"
                ? `🟢 ${data.nickname} joined the room.`
                : `🔴 ${data.nickname} left the room.`;

            messages.appendChild(messageElement);
            messages.scrollTop = messages.scrollHeight;

            // Show prompt if only one user is present
            if (data.isAlone) {
                const chatbotPrompt = document.getElementById("chatbot-prompt");
                chatbotPrompt.style.display = "block"; // Show the chatbot prompt
            }
        } else if (data.type === "system" && data.showAiOption) {
            // Handle system message with AI chat option
            const chatbotPrompt = document.getElementById("chatbot-prompt");
            chatbotPrompt.style.display = "block";
        }
    };

    socket.onclose = () => {
        alert("Disconnected from the room.");
        window.location.href = "/";
    };
}

function sendMessage() {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value.trim();
    if (message && socket) {
        // Show the user's message in the chatbox
        const messages = document.getElementById("messages");
        const messageElement = document.createElement("div");
        messageElement.className = "message user"; // Ensure it's styled as a user message
        messageElement.innerText = message;
        messages.appendChild(messageElement);

        // Send the message to the server
        socket.send(message);
        messageInput.value = ""; // Clear the input field
        messages.scrollTop = messages.scrollHeight; // Scroll to the latest message
    }
}

function leaveRoom() {
    if (socket) {
        socket.close();
    }
}

function redirectToAiChat() {
    window.location.href = "/ai-chat";
}

function stayInRoom() {
    const aiStatus = document.getElementById("ai-status");
    aiStatus.style.display = "none";
}
