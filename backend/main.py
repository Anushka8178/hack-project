# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# import base64
# import json
# import os
# import requests
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# app = FastAPI()

# # Configure CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allow all origins for development
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class AudioRequest(BaseModel):
#     audio_base64: str

# class TextRequest(BaseModel):
#     text: str
#     location: str = ""

# @app.get("/")
# async def root():
#     return {"message": "Welcome to Awaaz API", "status": "running"}

# @app.get("/api/health")
# async def health_check():
#     return {"status": "healthy", "message": "Server is running"}

# @app.post("/api/transcribe")
# async def transcribe_audio(request: AudioRequest):
#     try:
#         # Get DeepSeek API key from environment variables
#         api_key = os.getenv("DEEPSEEK_API_KEY")
#         if not api_key:
#             return JSONResponse(
#                 status_code=500,
#                 content={"error": "DeepSeek API key not configured"}
#             )

#         # Decode base64 audio
#         try:
#             audio_data = base64.b64decode(request.audio_base64)
#         except Exception as e:
#             return JSONResponse(
#                 status_code=400,
#                 content={"error": f"Invalid audio data: {str(e)}"}
#             )

#         # Prepare the request to DeepSeek API
#         headers = {
#             "Authorization": f"Bearer {api_key}",
#             "Content-Type": "audio/wav"
#         }

#         # Make request to DeepSeek API
#         try:
#             response = requests.post(
#                 "https://api.deepseek.com/v1/audio/transcriptions",
#                 headers=headers,
#                 data=audio_data
#             )
#             response.raise_for_status()  # Raise an exception for bad status codes
#         except requests.exceptions.RequestException as e:
#             return JSONResponse(
#                 status_code=500,
#                 content={"error": f"DeepSeek API error: {str(e)}"}
#             )

#         transcription = response.json().get("text", "")
#         return {"transcription": transcription}

#     except Exception as e:
#         return JSONResponse(
#             status_code=500,
#             content={"error": f"Server error: {str(e)}"}
#         )

# @app.post("/api/categorize")
# async def categorize_complaint(request: TextRequest):
#     try:
#         # Mock categorization
#         categories = ["water", "electricity", "roads", "garbage", "other"]
#         return {"category": categories[0]}  # Always return first category for now
#     except Exception as e:
#         return JSONResponse(
#             status_code=500,
#             content={"error": f"Server error: {str(e)}"}
#         )

# @app.post("/api/generate-email")
# async def create_email(request: TextRequest):
#     try:
#         # Mock email generation
#         mock_email = f"""
# Dear Authorities,

# I am writing to report an issue regarding {request.text} at location {request.location}.

# This is a mock email generated for demonstration purposes.

# Best regards,
# Awaaz User
# """
#         return {"email": mock_email}
#     except Exception as e:
#         return JSONResponse(
#             status_code=500,
#             content={"error": f"Server error: {str(e)}"}
#         )

# @app.post("/api/extract-entities")
# async def get_entities(request: TextRequest):
#     try:
#         # Mock entity extraction
#         mock_entities = {
#             "issue_category": "mock_category",
#             "location": request.location,
#             "urgency": "medium"
#         }
#         return {"entities": mock_entities}
#     except Exception as e:
#         return JSONResponse(
#             status_code=500,
#             content={"error": f"Server error: {str(e)}"}
#         ) 