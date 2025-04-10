async function analyzeText() {
    const text = document.getElementById("text-input").value;
    const spinner = document.getElementById("spinner");
    const resultEl = document.getElementById("result");

    spinner.style.display = "block";
    resultEl.innerText = "";

    const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });

    const data = await response.json();
    spinner.style.display = "none";
    resultEl.innerText = `Sentiment: ${data.sentiment.toUpperCase()} (Confidence: ${data.confidence})`;
}

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

async function toggleRecording() {
    const recordBtn = document.getElementById("record-btn");
    const waveform = document.getElementById("waveform");
    const spinner = document.getElementById("spinner");
    const resultEl = document.getElementById("result");

    if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            waveform.style.display = "none";
            spinner.style.display = "block";
            resultEl.innerText = "Transcribing your speech...";

            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append("file", audioBlob, "voice_input.webm");

            const response = await fetch("http://127.0.0.1:8000/transcribe/", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            const transcript = data.transcription;

            spinner.style.display = "none";
            document.getElementById("text-input").value = transcript;
            resultEl.innerText = `You said: "${transcript}"`;

            analyzeText();
            audioChunks = [];
        };

        audioChunks = [];
        mediaRecorder.start();
        waveform.style.display = "block";
        recordBtn.innerText = "🛑 Stop Recording";
        isRecording = true;
    } else {
        mediaRecorder.stop();
        isRecording = false;
        document.getElementById("record-btn").innerText = "🎙 Start Recording";
    }
}

async function uploadAudio() {
    const fileInput = document.getElementById("audio-input");
    const spinner = document.getElementById("spinner");
    const resultEl = document.getElementById("result");

    if (fileInput.files.length === 0) {
        alert("Please select an audio file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    spinner.style.display = "block";
    resultEl.innerText = "Transcribing audio...";

    try {
        const response = await fetch("http://127.0.0.1:8000/transcribe/", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Failed to transcribe audio.");
        }

        const data = await response.json();
        const transcript = data.transcription;

        document.getElementById("text-input").value = transcript;
        resultEl.innerText = `You said: "${transcript}"`;

        analyzeText();
    } catch (error) {
        resultEl.innerText = "Error: Unable to transcribe audio.";
        console.error(error);
    } finally {
        spinner.style.display = "none";
    }
}
