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
        document.getElementById("messages").innerHTML = "Connected to the room.<br>";
    };

    socket.onmessage = (event) => {
        const messages = document.getElementById("messages");
        const messageElement = document.createElement("div");
        const data = JSON.parse(event.data);

        if (data.type === "join") {
            messageElement.innerText = `🟢 ${data.nickname} joined the room.`;
            messageElement.style.color = data.color;
            messageElement.classList.add("system-message");
        } else if (data.type === "leave") {
            messageElement.innerText = `🔴 ${data.nickname} left the room.`;
            messageElement.style.color = data.color;
            messageElement.classList.add("system-message");
        } else if (data.type === "message") {
            const senderSpan = document.createElement("span");
            senderSpan.style.color = data.color;
            senderSpan.style.fontWeight = "bold";
            senderSpan.innerText = data.nickname;

            const messageSpan = document.createElement("span");
            messageSpan.innerText = `: ${data.message}`;

            messageElement.appendChild(senderSpan);
            messageElement.appendChild(messageSpan);

            if (data.nickname === nickname) {
                messageElement.classList.add("user");
                messageElement.style.textAlign = "left";
            } else {
                messageElement.classList.add("other");
                messageElement.style.textAlign = "right";
            }
        }

        messages.appendChild(messageElement);
        messages.scrollTop = messages.scrollHeight;
    };

    socket.onclose = () => {
        alert("Disconnected from the room.");
        window.location.href = "/";
    };
}

function sendMessage() {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;
    if (message && socket) {
        socket.send(message);
        messageInput.value = "";
    }
}

function leaveRoom() {
    if (socket) {
        socket.close();
    }
}
