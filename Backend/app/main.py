import os
import logging
import unicodedata
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import List, Optional, Tuple

import numpy as np
import soundfile as sf
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, BaseSettings
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from TTS.api import TTS

# ================= Settings =================
class Settings(BaseSettings):
    asr_model: str = "benax-rw/KinyaWhisper"
    tts_model: str = "tts_models/multilingual/multi-dataset/xtts_v2"
    nlp_model: str = "distiluse-base-multilingual-cased-v2"
    reference_audio: Path = Path("reference_audio.wav")
    audio_output_dir: Path = Path("output")
    min_confidence: float = 0.4
    max_text_length: int = 500
    device: str = "cpu"  # Force CPU usage
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# ================= Initialization =================
Path(settings.audio_output_dir).mkdir(exist_ok=True, parents=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("KinyaTutor")

app = FastAPI(
    title="KinyaTutor API",
    description="Kinyarwanda Voice Assistant for Intelligent Robotics",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= Data Models =================
class QAPair(BaseModel):
    question: str
    answer: str
    alternatives: List[str] = []

class MatchResponse(BaseModel):
    matched_question: Optional[str]
    answer: str
    confidence: float

# ================= NLP Setup =================
qa_data = [
    QAPair(
        question="Rwanda Coding Academy iherereye he?",
        answer="Iherereye mu Karere ka Nyabihu, mu Ntara y'Iburengerazuba.",
        alternatives=["Rwanda Coding Academy iri he?", "Location ya RCA?"]
    ),
    QAPair(
        question="Umurwa mukuru w'u Rwanda ni uwuhe?",
        answer="Ni Kigali.",
        alternatives=["Ikipe y'igihugu y'u Rwanda iherereye he?"]
    ),
    QAPair(
        question="Ikinyarwanda ni ururimi ruvugwa he?",
        answer="Ikinyarwanda ni ururimi ruvugwa mu Rwanda no mu bihugu bikikije.",
        alternatives=["Ikinyarwanda kivugwa he?", "Ni hehe bavuga Ikinyarwanda?"]
    ),
    QAPair(
        question="U Rwanda rufite abaturage bangahe?",
        answer="U Rwanda rufite abaturage barenga miliyoni 13 ukurikije ibarura rya 2022.",
        alternatives=["Abaturage b'u Rwanda ni bangahe?", "Population y'u Rwanda?"]
    ),
    QAPair(
        question="Ni ryari u Rwanda rwabonye ubwigenge?",
        answer="U Rwanda rwabonye ubwigenge ku itariki ya 1 Nyakanga 1962.",
        alternatives=["Independence y'u Rwanda yabaye ryari?", "U Rwanda rwigendeye ryari?"]
    ),
    QAPair(
        question="Ni ibihe bihugu Rwanda ihana imbibi?",
        answer="U Rwanda ruhana imbibi na Uganda mu majyaruguru, Tanzaniya mu burasirazuba, Burundi mu majyepfo, na Repubulika Iharanira Demokarasi ya Kongo mu burengerazuba.",
        alternatives=["Ibihugu bihana imbibi n'u Rwanda ni ibihe?", "U Rwanda ruzengurutswe n'ibihe bihugu?"]
    ),
    QAPair(
        question="Ni iyihe ndirimbo y'igihugu y'u Rwanda?",
        answer="Indirimbo y'igihugu y'u Rwanda ni 'Rwanda Nziza'.",
        alternatives=["National anthem y'u Rwanda ni iyihe?", "U Rwanda rufite ndirimbo y'igihugu yitwa iki?"]
    ),
    QAPair(
        question="Ni iki kiranga ibendera ry'u Rwanda?",
        answer="Ibendera ry'u Rwanda rigizwe n'amabara atatu: ubururu, umuhondo, n'icyatsi kibisi, hamwe n'izuba riri mu ruhande rw'iburyo.",
        alternatives=["Flag y'u Rwanda igizwe n'iki?", "Ibendera ry'u Rwanda rifite amabara angahe?"]
    ),
    QAPair(
        question="Amazi mu Kinyarwanda ni iki?",
        answer="Amazi mu Kinyarwanda ni 'Amazi'.",
        alternatives=["Water mu Kinyarwanda?", "Bavuga bate amazi mu Kinyarwanda?"]
    ),
    QAPair(
        question="Muraho mu Cyongereza ni iki?",
        answer="Muraho mu Cyongereza ni 'Hello' cyangwa 'Good morning'.",
        alternatives=["Hello mu Kinyarwanda?", "Bavuga bate muraho mu Cyongereza?"]
    )
]

try:
    nlp_model = SentenceTransformer(settings.nlp_model)
    all_questions = [
        qa.question for qa in qa_data
    ] + [
        alt for qa in qa_data for alt in qa.alternatives
    ]
    question_embeddings = nlp_model.encode(all_questions, show_progress_bar=False)
except Exception as e:
    logger.error(f"NLP initialization failed: {e}")
    nlp_model = None
    question_embeddings = None

# ================= ASR Setup =================
try:
    logger.info("Initializing ASR model...")
    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        settings.asr_model,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True
    )
    processor = AutoProcessor.from_pretrained(settings.asr_model)
    asr_pipeline = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        device=settings.device,
        generate_kwargs={"language": "rw"}  # Force Kinyarwanda
    )
except Exception as e:
    logger.error(f"ASR initialization failed: {e}")
    raise RuntimeError("ASR model loading failed")

# ================= TTS Setup =================
try:
    logger.info("Initializing TTS...")
    tts = TTS(model_name=settings.tts_model, progress_bar=False, gpu=False)
    if not settings.reference_audio.exists():
        raise FileNotFoundError(f"Reference audio {settings.reference_audio} not found")
except Exception as e:
    logger.error(f"TTS initialization failed: {e}")
    raise RuntimeError("TTS initialization failed")

# ================= Core Logic =================
def normalize_kinyarwanda(text: str) -> str:
    """Normalize Kinyarwanda text for matching"""
    text = unicodedata.normalize('NFKD', text.casefold())
    return ''.join([c for c in text if not unicodedata.combining(c)]).translate(
        str.maketrans("", "", ".,?!;:'\"()[]{}")
    )

def find_best_match(query: str) -> Tuple[Optional[str], str, float]:
    """Three-tier matching system for Kinyarwanda"""
    normalized = normalize_kinyarwanda(query)
    
    # 1. Exact match check
    for qa in qa_data:
        if normalized == normalize_kinyarwanda(qa.question):
            return qa.question, qa.answer, 1.0
        for alt in qa.alternatives:
            if normalized == normalize_kinyarwanda(alt):
                return qa.question, qa.answer, 0.95

    # 2. Semantic matching
    if nlp_model and question_embeddings is not None:
        query_embed = nlp_model.encode([normalized], show_progress_bar=False)
        similarities = cosine_similarity(query_embed, question_embeddings)[0]
        max_idx = np.argmax(similarities)
        if similarities[max_idx] >= settings.min_confidence:
            matched_question = all_questions[max_idx]
            return matched_question, qa_data[max_idx % len(qa_data)].answer, float(similarities[max_idx])

    # 3. Fuzzy fallback
    normalized_questions = [normalize_kinyarwanda(q) for q in all_questions]
    matches = get_close_matches(normalized, normalized_questions, n=1, cutoff=settings.min_confidence)
    if matches:
        idx = normalized_questions.index(matches[0])
        return all_questions[idx], qa_data[idx % len(qa_data)].answer, 0.9

    return None, "Mbabarira, sinzi igisubizo cy'icyo kibazo.", 0.0

# ================= API Endpoints =================
@app.post("/transcribe/", response_model=dict)
async def transcribe_audio(file: UploadFile = File(...)):
    """Convert Kinyarwanda speech to text"""
    try:
        if not file.content_type.startswith("audio/"):
            raise HTTPException(400, "Ingingo ya dosiye ntabwo ari audio")
        
        with NamedTemporaryFile(suffix=".wav") as tmp:
            tmp.write(await file.read())
            audio, rate = sf.read(tmp.name)
            
            if audio.ndim > 1:
                audio = np.mean(audio, axis=1)
            
            result = asr_pipeline({"raw": audio, "sampling_rate": rate})
            return {"transcription": result["text"].strip()}
            
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(500, "Ikosa mu guhindura ijwi kuri inyandiko")

@app.post("/match-answer/", response_model=MatchResponse)
async def match_answer(question: str = Form(...)):
    """Find best answer for a Kinyarwanda question"""
    try:
        matched_question, answer, confidence = find_best_match(question)
        return MatchResponse(
            matched_question=matched_question,
            answer=answer,
            confidence=confidence
        )
    except Exception as e:
        logger.error(f"Matching error: {e}")
        raise HTTPException(500, "Ikosa mu gusubiza ikibazo")

@app.post("/text-to-speech/", response_class=FileResponse)
async def text_to_speech(text: str = Form(...)):
    """Convert text to Kinyarwanda speech"""
    try:
        if len(text) > settings.max_text_length:
            raise HTTPException(400, "Inyandiko ndende cyane (max 500 imibare)")
        
        output_path = settings.audio_output_dir / f"tts_{hash(text)}.wav"
        tts.tts_to_file(
            text=text,
            file_path=str(output_path),
            speaker_wav=str(settings.reference_audio),
            language="rw"
        )
        return FileResponse(output_path, media_type="audio/wav")
        
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(500, "Ikosa mu guhindura inyandiko kuri ijwi")

@app.post("/process-audio/", response_model=dict)
async def process_audio(file: UploadFile = File(...)):
    """Full audio processing pipeline"""
    try:
        # Transcribe
        result = await transcribe_audio(file)
        transcription = result["transcription"]
        
        # Match answer
        match_result = await match_answer(transcription)
        
        # Generate speech
        tts_response = await text_to_speech(match_result.answer)
        
        return {
            "transcription": transcription,
            "answer": match_result.answer,
            "audio_url": f"/audio/{Path(tts_response.path).name}",
            "confidence": match_result.confidence
        }
        
    except Exception as e:
        logger.error(f"Processing error: {e}")
        raise HTTPException(500, "Ikosa mu gucunga audio")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models": {
            "asr": settings.asr_model,
            "tts": settings.tts_model,
            "nlp": settings.nlp_model
        }
    }

app.mount("/audio", StaticFiles(directory=settings.audio_output_dir), name="audio")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)