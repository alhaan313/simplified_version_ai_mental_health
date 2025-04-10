import whisper
import os
from fastapi import UploadFile

# Load the Whisper model
model = whisper.load_model("base")  # You can try "tiny", "small", "medium" too

def transcribe_audio(file: UploadFile):
    try:
        # Save uploaded audio to a temporary file
        temp_path = f"temp_audio_{file.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(file.file.read())

        # Transcribe using Whisper
        result = model.transcribe(temp_path)
        os.remove(temp_path)  # Clean up
        return {"text": result["text"]}
    except Exception as e:
        return {"error": str(e)}
