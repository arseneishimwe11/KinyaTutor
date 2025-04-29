from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from difflib import get_close_matches
import os
import tempfile
import torch
from transformers import pipeline
import soundfile as sf
from TTS.api import TTS

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize KinyaWhisper ASR model
try:
    asr_pipeline = pipeline(
        "automatic-speech-recognition",
        model="benax-rw/KinyaWhisper",
        device="cuda" if torch.cuda.is_available() else "cpu"
    )
    print("KinyaWhisper ASR model loaded successfully")
except Exception as e:
    print(f"Error loading KinyaWhisper model: {str(e)}")
    print("Falling back to default Whisper model")
    asr_pipeline = pipeline(
        "automatic-speech-recognition",
        model="openai/whisper-small",
        device="cuda" if torch.cuda.is_available() else "cpu"
    )

# Initialize TTS model
try:
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=False)
    print("TTS model loaded successfully")
except Exception as e:
    print(f"Error loading TTS model: {str(e)}")

# Create output directory for audio files
os.makedirs("output", exist_ok=True)

# Expanded Question-Answer pairs in Kinyarwanda
qa_pairs = {
    # Original pairs
    "rwanda coding academy iherereye he": "Iherereye mu Karere ka Nyabihu, mu Ntara y'Iburengerazuba.",
    "umurwa mukuru w'u rwanda ni uwuhe": "Ni Kigali.",
    "ikinyarwanda ni ururimi ruvugwa he": "Ikinyarwanda ni ururimi ruvugwa mu Rwanda no mu bihugu bikikije.",
    "u rwanda rufite abaturage bangahe": "U Rwanda rufite abaturage barenga miliyoni 13 ukurikije ibarura rya 2022.",
    "ni iki gisigaye kugira ngo umwaka urangire": "Hasigaye amezi make kugira ngo umwaka urangire.",
    "ni ryari u rwanda rwabonye ubwigenge": "U Rwanda rwabonye ubwigenge ku itariki ya 1 Nyakanga 1962.",
    "ni ikihe gihugu rwanda ihana imbibi": "U Rwanda ruhana imbibi na Uganda mu majyaruguru, Tanzaniya mu burasirazuba, Burundi mu majyepfo, na Repubulika Iharanira Demokarasi ya Kongo mu burengerazuba.",
    "ni iyihe ndirimbo y'igihugu y'u rwanda": "Indirimbo y'igihugu y'u Rwanda ni 'Rwanda Nziza'.",
    "ni iki kiranga ibendera ry'u rwanda": "Ibendera ry'u Rwanda rigizwe n'amabara atatu: ubururu, umuhondo, n'icyatsi kibisi, hamwe n'izuba riri mu ruhande rw'iburyo.",
    
    # Additional pairs
    "muraho": "Mwaramutse neza! Mbwira icyo nakugezaho.",
    "amakuru": "Amakuru ni meza, urakoze kubaza.",
    "witwa nde": "Nitwa KinyaTutor, ndi umufasha wo kwiga Ikinyarwanda.",
    "imodoka mu kinyarwanda": "Imodoka mu Kinyarwanda ni 'imodoka'.",
    "amazi mu kinyarwanda": "Amazi mu Kinyarwanda ni 'amazi'.",
    "umwaka mu kinyarwanda": "Umwaka mu Kinyarwanda ni 'umwaka'.",
    "igitabo mu kinyarwanda": "Igitabo mu Kinyarwanda ni 'igitabo'.",
    "umuntu mu kinyarwanda": "Umuntu mu Kinyarwanda ni 'umuntu'.",
    "umwana mu kinyarwanda": "Umwana mu Kinyarwanda ni 'umwana'.",
    "ishuri mu kinyarwanda": "Ishuri mu Kinyarwanda ni 'ishuri'.",
    "umurima mu kinyarwanda": "Umurima mu Kinyarwanda ni 'umurima'.",
    
    # English questions with Kinyarwanda answers
    "what is hello in kinyarwanda": "Hello mu Kinyarwanda ni 'Muraho' cyangwa 'Mwaramutse'.",
    "how do you say water in kinyarwanda": "Water mu Kinyarwanda ni 'Amazi'.",
    "how do you say car in kinyarwanda": "Car mu Kinyarwanda ni 'Imodoka'.",
    "how do you say book in kinyarwanda": "Book mu Kinyarwanda ni 'Igitabo'.",
    "how do you say person in kinyarwanda": "Person mu Kinyarwanda ni 'Umuntu'.",
    "how do you say child in kinyarwanda": "Child mu Kinyarwanda ni 'Umwana'.",
    "how do you say school in kinyarwanda": "School mu Kinyarwanda ni 'Ishuri'.",
    "how do you say farm in kinyarwanda": "Farm mu Kinyarwanda ni 'Umurima'.",
    
    # Additional English questions
    "where is rwanda coding academy located": "Rwanda Coding Academy iherereye mu Karere ka Nyabihu, mu Ntara y'Iburengerazuba.",
    "what is the capital city of rwanda": "Umurwa mukuru w'u Rwanda ni Kigali.",
    "where is kinyarwanda spoken": "Ikinyarwanda kivugwa mu Rwanda no mu bihugu bikikije.",
    "how many people live in rwanda": "U Rwanda rufite abaturage barenga miliyoni 13 ukurikije ibarura rya 2022.",
    "when did rwanda gain independence": "U Rwanda rwabonye ubwigenge ku itariki ya 1 Nyakanga 1962.",
}

# English translations for better matching
english_to_kinyarwanda = {
    "where is rwanda coding academy located": "rwanda coding academy iherereye he",
    "what is the capital city of rwanda": "umurwa mukuru w'u rwanda ni uwuhe",
    "where is kinyarwanda spoken": "ikinyarwanda ni ururimi ruvugwa he",
    "how many people live in rwanda": "u rwanda rufite abaturage bangahe",
    "when did rwanda gain independence": "ni ryari u rwanda rwabonye ubwigenge",
}

@app.get("/")
async def root():
    return {"message": "Welcome to KinyaTutor API. Use /docs for API documentation."}

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe an audio file using KinyaWhisper ASR
    """
    try:
        # Save uploaded file temporarily
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_file.close()
        
        with open(temp_file.name, "wb") as f:
            f.write(await file.read())
        
        # Transcribe using KinyaWhisper
        result = asr_pipeline(temp_file.name)
        transcription = result["text"]
        
        # Clean up
        os.unlink(temp_file.name)
        
        return {"transcription": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")

@app.post("/match-answer/")
async def match_answer(question: str = Form(...)):
    """
    Match a transcribed question to the closest answer in our database
    """
    try:
        # Log the incoming question for debugging
        print(f"Received question: {question}")
        
        # Normalize question (lowercase, remove punctuation)
        normalized_question = question.lower().strip()
        for char in ".,?!;:":
            normalized_question = normalized_question.replace(char, "")
        
        print(f"Normalized question: {normalized_question}")
        
        # Try direct match first
        if normalized_question in qa_pairs:
            return {
                "matched_question": normalized_question,
                "answer": qa_pairs[normalized_question],
                "confidence": 1.0
            }
        
        # Check if it's an English question with a known translation
        if normalized_question in english_to_kinyarwanda:
            kinyarwanda_question = english_to_kinyarwanda[normalized_question]
            return {
                "matched_question": kinyarwanda_question,
                "answer": qa_pairs[kinyarwanda_question],
                "confidence": 0.9
            }
        
        # Try fuzzy matching with a lower threshold
        matches = get_close_matches(normalized_question, qa_pairs.keys(), n=1, cutoff=0.4)
        
        if matches:
            matched_question = matches[0]
            answer = qa_pairs[matched_question]
            confidence = round(1 - (1 - 0.4) * (1 - len(matches[0])/max(len(normalized_question), 1)), 2)
            
            print(f"Matched question: {matched_question}, Answer: {answer}, Confidence: {confidence}")
            
            return {
                "matched_question": matched_question,
                "answer": answer,
                "confidence": confidence
            }
        
        # If no match found, check if it's an English question about Kinyarwanda
        if any(word in normalized_question for word in ["kinyarwanda", "rwanda"]):
            if any(word in normalized_question for word in ["how", "say", "translate", "what is"]):
                return {
                    "matched_question": None,
                    "answer": "I'm not sure how to translate that specific word or phrase to Kinyarwanda. Try asking about common words like 'hello', 'water', or 'car'.",
                    "confidence": 0.3
                }
        
        # Default response when no match is found
        return {
            "matched_question": None,
            "answer": "Mbabarira, sinzi igisubizo cy'icyo kibazo. (Sorry, I don't know the answer to that question.)",
            "confidence": 0
        }
    except Exception as e:
        print(f"Error in match_answer: {str(e)}")
        return {
            "matched_question": None,
            "answer": "Sorry, there was an error processing your question. Please try again.",
            "confidence": 0
        }

@app.post("/text-to-speech/")
async def text_to_speech(text: str = Form(...)):
    """
    Convert text to speech using TTS
    """
    try:
        # Create a unique filename
        output_filename = f"output/speech_{hash(text) % 10000}.wav"
        
        # Generate speech
        tts.tts_to_file(
            text=text,
            file_path=output_filename,
            speaker_wav="reference_audio.wav",  # Make sure this file exists
            language="rw"
        )
        
        # Return the audio file
        return FileResponse(output_filename, media_type="audio/wav")
    except Exception as e:
        print(f"Error in text_to_speech: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@app.post("/process-audio/")
async def process_audio(file: UploadFile = File(...)):
    """
    Process an audio file: transcribe, match to an answer, and generate speech response
    """
    try:
        # Save uploaded file temporarily
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_file.close()
        
        with open(temp_file.name, "wb") as f:
            f.write(await file.read())
        
        # Transcribe using KinyaWhisper
        result = asr_pipeline(temp_file.name)
        transcription = result["text"]
        
        # Match to an answer
        match_result = await match_answer(question=transcription)
        answer = match_result["answer"]
        
        # Generate speech for the answer
        output_filename = f"output/response_{hash(answer) % 10000}.wav"
        
        tts.tts_to_file(
            text=answer,
            file_path=output_filename,
            speaker_wav="reference_audio.wav",  # Make sure this file exists
            language="rw"
        )
        
        # Clean up
        os.unlink(temp_file.name)
        
        return {
            "transcription": transcription,
            "answer": answer,
            "audio_url": f"/audio/{os.path.basename(output_filename)}"
        }
    except Exception as e:
        print(f"Error in process_audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

# Serve static files
from fastapi.staticfiles import StaticFiles
app.mount("/audio", StaticFiles(directory="output"), name="audio")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
