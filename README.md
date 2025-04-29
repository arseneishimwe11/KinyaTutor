# 🇷🇼 KinyaTutor: Kinyarwanda Voice Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/arseneishimwe11/KinyaTutor)](https://github.com/arseneishimwe11/KinyaTutor/issues)
[![GitHub forks](https://img.shields.io/github/forks/arseneishimwe11/KinyaTutor)](https://github.com/arseneishimwe11/KinyaTutor/network)
[![GitHub stars](https://img.shields.io/github/stars/arseneishimwe11/KinyaTutor)](https://github.com/arseneishimwe11/KinyaTutor/stargazers)
[![GitHub last commit](https://img.shields.io/github/last-commit/arseneishimwe11/KinyaTutor)](https://github.com/arseneishimwe11/KinyaTutor/commits/main)
[![Made with FastAPI](https://img.shields.io/badge/Made%20with-FastAPI-0ba360.svg)](https://fastapi.tiangolo.com/)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000.svg)](https://nextjs.org/)
[![Made with Tailwind CSS](https://img.shields.io/badge/Made%20with-Tailwind%20CSS-38b2ac.svg)](https://tailwindcss.com/)
[![Made with ❤️ in Rwanda](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20in%20Rwanda-ff69b4.svg)](https://en.wikipedia.org/wiki/Rwanda)

KinyaTutor is an interactive voice assistant that helps users learn and practice Kinyarwanda. It simulates how intelligent robots can communicate in local languages, empowering them to assist Rwandan communities.

## ✨ Features

- **Speech Recognition (ASR)**: Transcribes Kinyarwanda speech to text using KinyaWhisper
- **Natural Language Processing (NLP)**: Matches questions to appropriate answers
- **Text-to-Speech (TTS)**: Speaks answers back in Kinyarwanda
- **Interactive UI**: Quiz mode and conversational mode
- **Audio Visualization**: Visual feedback for audio processing

## 📂 Project Structure

```
KinyaTutor/
├── Backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Main API endpoints
│   │   └── utils.py        # Utility functions
│   ├── reference_audio.wav # Reference audio for TTS
│   └── requirements.txt    # Python dependencies
├── Frontend/               # Next.js frontend
│   ├── components/         # React components
│   ├── lib/                # Utility functions and API client
│   ├── pages/              # Next.js pages
│   ├── public/             # Static assets
│   └── styles/             # CSS styles
└── README.md               # Project documentation
```

## ⚙️ Technologies Used

- **Backend**:
  - FastAPI: Modern, fast web framework for building APIs
  - KinyaWhisper: ASR model fine-tuned for Kinyarwanda
  - Coqui TTS: Text-to-speech synthesis
  - Difflib: For fuzzy matching questions

- **Frontend**:
  - Next.js: React framework for production
  - Tailwind CSS: Utility-first CSS framework
  - Web Speech API: For browser-based speech recognition
  - Web Audio API: For audio visualization

## 🚀 Setup and Installation

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/KinyaTutor.git
   cd KinyaTutor/Backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Download a reference audio file for TTS:
   ```bash
   curl -L https://github.com/coqui-ai/TTS/raw/main/tests/inputs/common_voice_kab_male.wav -o reference_audio.wav
   ```

4. Start the backend server:
   ```bash
   cd app
   uvicorn main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the backend URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧠 Usage

### 📚 Quiz Mode

1. Select "KinyaQuiz" mode
2. Read the English phrase to translate
3. Click the microphone button and speak the Kinyarwanda translation
4. Check your answer against the correct translation
5. Listen to the correct pronunciation

### 🎯 Challenge Mode

1. Select "Challenge Me" mode
2. Ask any question about Kinyarwanda (in English or Kinyarwanda)
3. The assistant will respond with text and speech
4. Continue the conversation to learn more

## ❓ Sample Questions

Here are some sample questions you can ask in Kinyarwanda:

- "Rwanda Coding Academy iherereye he?"
- "Umurwa mukuru w'u Rwanda ni uwuhe?"
- "Ikinyarwanda ni ururimi ruvugwa he?"
- "U Rwanda rufite abaturage bangahe?"
- "Ni ryari u Rwanda rwabonye ubwigenge?"

Or in English:

- "Where is Rwanda Coding Academy located?"
- "What is the capital city of Rwanda?"
- "How do you say hello in Kinyarwanda?"
- "How do you say water in Kinyarwanda?"
- "When did Rwanda gain independence?"

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚡ Quick Reference
```

### 5. Create a requirements.txt file

```text:Backend/requirements.txt
fastapi==0.103.1
uvicorn==0.23.2
python-multipart==0.0.6
transformers==4.33.2
torch==2.0.1
soundfile==0.12.1
TTS==0.17.6
numpy==1.24.3
pydantic==2.3.0
```

### 6. Create a Backend utils.py file

```python:Backend/app/utils.py
import os
import tempfile
from typing import List, Dict, Tuple, Optional
import soundfile as sf
import numpy as np

def preprocess_audio(file_path: str) -> str:
    """
    Preprocess audio file for better ASR performance
    
    Args:
        file_path: Path to the audio file
        
    Returns:
        Path to the preprocessed audio file
    """
    # Read audio file
    audio, sample_rate = sf.read(file_path)
    
    # Convert to mono if stereo
    if len(audio.shape) > 1:
        audio = audio.mean(axis=1)
    
    # Normalize audio
    audio = audio / np.max(np.abs(audio))
    
    # Create a temporary file for the preprocessed audio
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    temp_file.close()
    
    # Write preprocessed audio to file
    sf.write(temp_file.name, audio, sample_rate)
    
    return temp_file.name

def normalize_text(text: str) -> str:
    """
    Normalize text by converting to lowercase and removing punctuation
    
    Args:
        text: Input text
        
    Returns:
        Normalized text
    """
    text = text.lower().strip()
    for char in ".,?!;:":
        text = text.replace(char, "")
    return text

def calculate_confidence(matched_text: str, query_text: str, base_cutoff: float = 0.4) -> float:
    """
    Calculate confidence score for a match
    
    Args:
        matched_text: The matched text
        query_text: The query text
        base_cutoff: The base cutoff value
        
    Returns:
        Confidence score between 0 and 1
    """
    if not matched_text or not query_text:
        return 0
    
    # Length ratio factor
    length_ratio = len(matched_text) / max(len(query_text), 1)
    if length_ratio > 1:
        length_ratio = 1 / length_ratio
    
    # Calculate confidence
    confidence = round(1 - (1 - base_cutoff) * (1 - length_ratio), 2)
    
    return min(max(confidence, 0), 1)  # Ensure between 0 and 1
```

### 7. 🛠 Ensure the Backend Has the Required Files

Make sure the backend directory has the following structure:

```
Backend/
├── app/
│   ├── main.py         # Main API endpoints
│   └── utils.py        # Utility functions
├── reference_audio.wav # Reference audio for TTS
├── output/             # Directory for generated audio files
└── requirements.txt    # Python dependencies
```

### 8. Testing and Verification

To ensure everything is working properly:

1. Start the backend server:
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd app
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd Frontend
npm install
npm run dev
```

## 🌟 Final Note
KinyaTutor is more than an app — it's a step toward localized AI education and accessibility.
Thank you for using and improving it! 🇷🇼

