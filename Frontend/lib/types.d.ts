declare var SpeechRecognition: any

interface Window {
  SpeechRecognition: typeof SpeechRecognition
  webkitSpeechRecognition: typeof SpeechRecognition
}
