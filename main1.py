from fastapi import FastAPI, UploadFile, File, Form
from firebase_admin import credentials, initialize_app, storage, firestore
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from whisper_transcribe import transcribe_with_whisper
from deepseek_utils import categorize_text, extract_entities
import tempfile
import uuid
import os
import json

# Load Firebase
cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred, {"storageBucket": "your-bucket-name.appspot.com"})
db = firestore.client()
bucket = storage.bucket()

app = FastAPI()

# Allow all origins for hackathon/demo use
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/upload/")
async def upload_audio(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    timestamp: str = Form(...)
):
    try:
        contents = await file.read()
        unique_id = str(uuid.uuid4())

        # Step 1: Upload to Firebase Storage
        blob = bucket.blob(f"audio/{unique_id}_{file.filename}")
        blob.upload_from_string(contents, content_type=file.content_type)
        audio_url = blob.public_url

        # Step 2: Save temp audio for Whisper
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            temp_audio.write(contents)
            temp_path = temp_audio.name

        # Step 3: Transcribe using Whisper
        transcription = transcribe_with_whisper(temp_path)

        # Step 4: Use DeepSeek
        category = categorize_text(transcription)
        entities_raw = extract_entities(transcription)
        try:
            entities = json.loads(entities_raw)
        except:
            entities = {"error": "Could not parse entities", "raw": entities_raw}

        # Step 5: Save to Firestore
        complaint_data = {
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": timestamp,
            "audio_url": audio_url,
            "transcription": transcription,
            "category": category,
            "entities": entities,
            "upvotes": 0
        }

        db.collection("complaints").document(unique_id).set(complaint_data)

        return {"status": "success", "id": unique_id, "url": audio_url}
    except Exception as e:
        return {"status": "error", "message": str(e)}
