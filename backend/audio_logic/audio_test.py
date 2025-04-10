import whisper

model = whisper.load_model("tiny")
result = model.transcribe(r"D:\Programming\Simplified_Agentic_AI-Mental-Heatlh-checker\audio_samples\audio1.m4a")
print(result["text"])
