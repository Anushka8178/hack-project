import os
import requests

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
HEADERS = {
    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
    "Content-Type": "application/json"
}

def transcribe_audio_base64(audio_base64: str):
    payload = {
        "model": "deepseek-audio",
        "audio": audio_base64,
        "language": "auto",
        "response_format": "text"
    }
    response = requests.post(
        "https://api.deepseek.com/v1/audio/transcriptions",
        json=payload,
        headers=HEADERS
    )
    response.raise_for_status()
    return response.text

def categorize_text(text: str):
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": "You are a complaint categorization assistant. Categorize the following complaint into exactly one of these categories: water, electricity, roads, garbage, or other. Reply with only the category name in lowercase."
            },
            {"role": "user", "content": text}
        ],
        "temperature": 0.3
    }
    response = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        json=payload,
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip().lower()

def generate_email(complaint_text: str, category: str, location: str):
    prompt = (
        f"Write a formal complaint email about a {category} issue at location {location}: {complaint_text}"
    )
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": "You are an email assistant that creates formal complaint letters to government authorities. "
                           "Create a professional, concise email with: 1. Formal greeting 2. Clear statement of the issue "
                           "3. Details of the problem and its impact 4. Specific request for resolution 5. Professional closing. "
                           "The email should be 200-250 words and maintain a respectful but firm tone."
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    response = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        json=payload,
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

def extract_entities(text: str):
    prompt = (
        "Extract the issue_category, subcategory, location, time_reference, and urgency from the following complaint. "
        "Return the output as a JSON object. The complaint may be in any language.\n\n"
        f"Complaint: {text}"
    )
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }
    response = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        json=payload,
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()
