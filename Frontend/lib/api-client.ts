// API URL - change this to your backend URL in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Transcribes an audio file to text using the backend API
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioFile);

  const response = await fetch(`${API_URL}/transcribe/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to transcribe audio: ${response.statusText}`);
  }

  const data = await response.json();
  return data.transcription;
}

/**
 * Matches a question to an answer using the backend API
 */
export async function matchAnswer(question: string): Promise<{
  matched_question: string | null;
  answer: string;
  confidence: number;
}> {
  const formData = new FormData();
  formData.append("question", question);

  const response = await fetch(`${API_URL}/match-answer/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to match question: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Converts text to speech using the backend API
 */
export async function textToSpeech(text: string): Promise<string> {
  const formData = new FormData();
  formData.append("text", text);

  const response = await fetch(`${API_URL}/text-to-speech/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate speech: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Processes an audio file to get transcription, matched answer, and audio response
 */
export async function processAudio(audioFile: File): Promise<{
  transcription: string;
  matched_question: string | null;
  answer: string;
  confidence: number;
  audio_url?: string;
}> {
  const formData = new FormData();
  formData.append("file", audioFile);

  const response = await fetch(`${API_URL}/process-audio/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to process audio: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Checks if the backend API is available
 */
export async function checkApiStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health/`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
}
