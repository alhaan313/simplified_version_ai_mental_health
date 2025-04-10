/*
File: room-navigation.js
Purpose: Handles navigation to the meeting room.

Flow:
- Redirects the user to the meeting room page with the specified room ID.
*/
function navigateToRoom() {
    const roomId = document.getElementById("room-id").value;
    if (!roomId) {
        alert("Please enter a Room ID.");
        return;
    }
    window.location.href = `/meeting-room?room_id=${encodeURIComponent(roomId)}`;
}
