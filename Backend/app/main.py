from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
import uuid
import torch
import numpy as np
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from difflib import get_close_matches
import soundfile as sf
from TTS.api import TTS
import tempfile
import shutil

app = FastAPI(title="KinyaScribe API", description="Kinyarwanda Voice Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for storing audio files
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# Load KinyaWhisper model
processor = WhisperProcessor.from_pretrained("benax-rw/KinyaWhisper")
model = WhisperForConditionalGeneration.from_pretrained("benax-rw/KinyaWhisper")
model.config.forced_decoder_ids = None

# Initialize TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

# Question-Answer pairs in Kinyarwanda
qa_pairs = {
    "rwanda coding academy iherereye he": "Iherereye mu Karere ka Nyabihu, mu Ntara y'Iburengerazuba.",
    "umurwa mukuru w'u rwanda ni uwuhe": "Ni Kigali.",
    "ikinyarwanda ni ururimi ruvugwa he": "Ikinyarwanda ni ururimi ruvugwa mu Rwanda no mu bihugu bikikije.",
    "u rwanda rufite abaturage bangahe": "U Rwanda rufite abaturage barenga miliyoni 13 ukurikije ibarura rya 2022.",
    "ni iki gisigaye kugira ngo umwaka urangire": "Hasigaye amezi make kugira ngo umwaka urangire.",
    "ni ryari u rwanda rwabonye ubwigenge": "U Rwanda rwabonye ubwigenge ku itariki ya 1 Nyakanga 1962.",
    "ni ikihe gihugu Rwanda ihana imbibi": "U Rwanda ruhana imbibi na Uganda mu majyaruguru, Tanzaniya mu burasirazuba, Burundi mu majyepfo, na Repubulika Iharanira Demokarasi ya Kongo mu burengerazuba.",
    "ni iyihe ndirimbo y'igihugu y'u rwanda": "Indirimbo y'igihugu y'u Rwanda ni 'Rwanda Nziza'.",
    "ni iki kiranga ibendera ry'u rwanda": "Ibendera ry'u Rwanda rigizwe n'amabara atatu: ubururu, umuhondo, n'icyatsi kibisi, hamwe n'izuba riri mu ruhande rw'iburyo.",
}

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe Kinyarwanda audio to text using KinyaWhisper
    """
    if not file.filename.endswith((".wav", ".mp3", ".ogg")):
        raise HTTPException(status_code=400, detail="Only audio files are accepted (.wav, .mp3, .ogg)")
    
    # Save uploaded file
    file_path = f"uploads/{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Load audio
        audio_array, sampling_rate = sf.read(file_path)
        
        # Convert to mono if stereo
        if len(audio_array.shape) > 1:
            audio_array = audio_array.mean(axis=1)
        
        # Ensure audio is float32
        if audio_array.dtype != np.float32:
            audio_array = audio_array.astype(np.float32)
        
        # Normalize audio
        if np.abs(audio_array).max() > 1.0:
            audio_array = audio_array / np.abs(audio_array).max()
        
        # Process with KinyaWhisper
        input_features = processor(audio_array, sampling_rate=sampling_rate, return_tensors="pt").input_features
        
        # Generate token ids
        predicted_ids = model.generate(input_features)
        
        # Decode token ids to text
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        
        # Clean up
        os.remove(file_path)
        
        return {"transcription": transcription}
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@app.post("/match-answer/")
async def match_answer(question: str = Form(...)):
    """
    Match a transcribed question to the closest answer in our database
    """
    # Normalize question (lowercase, remove punctuation)
    normalized_question = question.lower().strip()
    for char in ".,?!;:":
        normalized_question = normalized_question.replace(char, "")
    
    # Find closest match in our QA pairs
    matches = get_close_matches(normalized_question, qa_pairs.keys(), n=1, cutoff=0.6)
    
    if matches:
        matched_question = matches[0]
        answer = qa_pairs[matched_question]
        return {
            "matched_question": matched_question,
            "answer": answer,
            "confidence": round(1 - (1 - 0.6) * (1 - len(matches[0])/len(normalized_question)), 2)
        }
    else:
        return {
            "matched_question": None,
            "answer": "Mbabarira, sinzi igisubizo cy'icyo kibazo.",
            "confidence": 0
        }

@app.post("/text-to-speech/")
async def text_to_speech(text: str = Form(...)):
    """
    Convert text to speech using TTS
    """
    try:
        # Generate a unique filename
        output_path = f"outputs/{uuid.uuid4()}.wav"
        
        # Generate speech
        tts.tts_to_file(text=text, file_path=output_path, speaker_wav="reference_audio.wav", language="rw")
        
        return FileResponse(
            path=output_path,
            media_type="audio/wav",
            filename="response.wav"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@app.post("/process-audio/")
async def process_audio(file: UploadFile = File(...)):
    """
    Complete pipeline: Transcribe audio, match to question, and generate speech response
    """
    # Step 1: Transcribe
    transcription_result = await transcribe_audio(file)
    transcription = transcription_result["transcription"]
    
    # Step 2: Match to answer
    matching_result = await match_answer(transcription)
    answer = matching_result["answer"]
    
    # Step 3: Generate speech
    output_path = f"outputs/{uuid.uuid4()}.wav"
    tts.tts_to_file(text=answer, file_path=output_path, speaker_wav="reference_audio.wav", language="rw")
    
    return {
        "transcription": transcription,
        "matched_question": matching_result["matched_question"],
        "answer": answer,
        "confidence": matching_result["confidence"],
        "audio_url": f"/download-audio/{os.path.basename(output_path)}"
    }

@app.get("/download-audio/{filename}")
async def download_audio(filename: str):
    """
    Download generated audio file
    """
    file_path = f"outputs/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        path=file_path,
        media_type="audio/wav",
        filename="response.wav"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
