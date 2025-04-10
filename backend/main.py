from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import os
import uvicorn
from fastapi import UploadFile, File
import whisper
import os

sentiment_pipeline = pipeline("sentiment-analysis")
model = whisper.load_model("base")  # You can try "tiny", "small", "medium" too
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

# Load sentiment pipeline (only once)

class TextInput(BaseModel):
    text: str

@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/analyze")
def analyze_text(input: TextInput):
    result = sentiment_pipeline(input.text)[0]
    sentiment = result["label"].lower()  # e.g., 'POSITIVE' or 'NEGATIVE'
    score = round(result["score"], 2)

    return {"sentiment": sentiment, "confidence": score}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save uploaded audio to a temporary file
        temp_path = f"temp_audio_{file.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())

        # Transcribe using Whisper
        result = model.transcribe(temp_path)
        os.remove(temp_path)  # Clean up
        print(result["text"])
        return {"text": result["text"]}
    except Exception as e:
        return {"error": str(e)}