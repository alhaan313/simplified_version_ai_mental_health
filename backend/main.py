from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from .sentiment import analyze_sentiment
from .transcription import transcribe_audio

templates = Jinja2Templates(directory="templates")

app = FastAPI()

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

@app.post("/analyze")
def analyze_text(input: TextInput):
    return analyze_sentiment(input.text)

@app.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    return transcribe_audio(file)