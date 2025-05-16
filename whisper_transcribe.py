import whisper

def transcribe_with_whisper(audio_path):
    model = whisper.load_model("base")  # You can also try "small" or "medium"
    result = model.transcribe(audio_path)
    return result["text"]
