from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uuid, os, base64
from dotenv import load_dotenv

# local modules
from rate_limit import limiter
from complaint import router as complaint_router
from firebase_init import db, bucket          # <-- shared Firebase
from deepseek_utils import transcribe_audio_base64, categorize_text, extract_entities, generate_email
load_dotenv()


# DeepSeek Key check
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    print("⚠️  DEEPSEEK_API_KEY not set—AI features will be disabled")

app = FastAPI()
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # TODO: Restrict this before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach routers
app.include_router(complaint_router)

@app.get("/")
def root():
    return {"message": "Awaaz backend is live!"}

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
        blob = bucket.blob(f"audio/{unique_id}_{file.filename}")
        blob.upload_from_string(contents, content_type=file.content_type)
        audio_url = blob.public_url

        # Convert audio to base64 for transcription
        audio_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Transcribe audio using DeepSeek
        transcription = transcribe_audio_base64(audio_base64)
        
        # Categorize the complaint
        category = categorize_text(transcription)
        
        # Extract entities from the complaint
        entities = extract_entities(transcription)

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
        return {
            "status": "success", 
            "id": unique_id, 
            "url": audio_url,
            "transcription": transcription,
            "category": category,
            "entities": entities
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/complaints/")
def get_complaints():
    try:
        docs = db.collection("complaints").stream()
        complaints = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            complaints.append(data)
        return complaints
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/upvote/{complaint_id}")
def upvote_complaint(complaint_id: str):
    try:
        ref = db.collection("complaints").document(complaint_id)
        ref.update({"upvotes": firestore.Increment(1)})
        return {"status": "success", "message": "Upvoted!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/generate-email/{complaint_id}")
async def generate_complaint_email(complaint_id: str):
    try:
        # Get complaint data from Firebase
        doc = db.collection("complaints").document(complaint_id).get()
        if not doc.exists:
            return {"status": "error", "message": "Complaint not found"}
        
        complaint_data = doc.to_dict()
        
        # First extract entities from the transcribed text
        entities = extract_entities(complaint_data['transcription'])
        
        # Generate email using the transcribed text and extracted entities
        email_content = generate_email(
            complaint_text=complaint_data['transcription'],
            category=entities.get('issue_category', ''),  # Use extracted category
            location=entities.get('location', '')         # Use extracted location
        )
        
        # Update the complaint document with both the entities and generated email
        db.collection("complaints").document(complaint_id).update({
            "entities": entities,
            "generated_email": email_content
        })
        
        return {
            "status": "success",
            "email_content": email_content,
            "entities": entities,
            "complaint_id": complaint_id
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
