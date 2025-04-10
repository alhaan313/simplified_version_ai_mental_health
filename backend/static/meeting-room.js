/*
File: meeting-room.js
Purpose: Handles WebSocket communication for the meeting room.

Flow:
- Connects to the WebSocket endpoint (/ws/{room_id}) in main.py.
- Sends and receives messages in real-time.
*/

let socket;

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("room_id");
    if (!roomId) {
        alert("Room ID is missing!");
        window.location.href = "/";
        return;
    }

    document.getElementById("room-info").innerText = `You are in room: ${roomId}`;
    socket = new WebSocket(`ws://127.0.0.1:8000/ws/${roomId}`);

    socket.onopen = () => {
        document.getElementById("messages").innerHTML = "Connected to the room.<br>";
    };

    socket.onmessage = (event) => {
        const messages = document.getElementById("messages");
        messages.innerHTML += event.data + "<br>";
        messages.scrollTop = messages.scrollHeight;
    };

    socket.onclose = () => {
        alert("Disconnected from the room.");
        window.location.href = "/";
    };
};

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
