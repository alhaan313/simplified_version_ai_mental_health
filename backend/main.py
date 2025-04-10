"""
File: main.py
Purpose: This is the main backend file for the FastAPI application. It defines API endpoints and WebSocket functionality.

Flow:
1. Sentiment Analysis:
   - Endpoint: /analyze
   - Flow: sentiment.py -> main.py

2. Audio Transcription:
   - Endpoint: /transcribe
   - Flow: transcription.py -> main.py

3. WebSocket for Chat Rooms:
   - Endpoint: /ws/{room_id}
   - Flow: main.py (manages WebSocket connections and room participants)

4. HTML Templates:
   - Endpoint: /
   - Endpoint: /therapy
   - Endpoint: /meeting-room
   - Flow: main.py -> templates/*.html
"""

from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.staticfiles import StaticFiles
from .sentiment import analyze_sentiment
from .transcription import transcribe_audio

templates = Jinja2Templates(directory="templates")

app = FastAPI()

# Mount the static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS setup to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/therapy", response_class=HTMLResponse)
def therapy_page(request: Request):
    return templates.TemplateResponse("therapy.html", {"request": request})

@app.get("/meeting-room", response_class=HTMLResponse)
def meeting_room(request: Request):
    return templates.TemplateResponse("meeting_room.html", {"request": request})

@app.post("/analyze")
def analyze_text(input: TextInput):
    return analyze_sentiment(input.text)

@app.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    return transcribe_audio(file)

rooms = {}  # In-memory dictionary to manage rooms and participants

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    if room_id not in rooms:
        rooms[room_id] = []
    rooms[room_id].append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            for participant in rooms[room_id]:
                if participant != websocket:
                    await participant.send_text(data)
    except WebSocketDisconnect:
        rooms[room_id].remove(websocket)
        if not rooms[room_id]:
            del rooms[room_id]