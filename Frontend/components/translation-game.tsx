"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, Mic, Check, X, Volume2, Upload, Edit2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"

// Sample questions - in a real app, this would come from a database or API
const questions = [
  {
    id: 1,
    english: "to read",
    kinyarwanda: "gusoma",
  },
  {
    id: 2,
    english: "to write",
    kinyarwanda: "kwandika",
  },
  {
    id: 3,
    english: "to speak",
    kinyarwanda: "kuvuga",
  },
  {
    id: 4,
    english: "to listen",
    kinyarwanda: "kumva",
  },
  {
    id: 5,
    english: "to eat",
    kinyarwanda: "kurya",
  },
  {
    id: 6,
    english: "to drink",
    kinyarwanda: "kunywa",
  },
  {
    id: 7,
    english: "to sleep",
    kinyarwanda: "kuryama",
  },
  {
    id: 8,
    english: "to walk",
    kinyarwanda: "kugenda",
  },
]

// Declare SpeechRecognition
declare var SpeechRecognition: any
declare var webkitSpeechRecognition: any

export default function TranslationGame() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [liveTranscript, setLiveTranscript] = useState("")
  const [result, setResult] = useState<"correct" | "wrong" | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTranscript, setEditedTranscript] = useState("")
  const [inputMethod, setInputMethod] = useState<"microphone" | "file">("microphone")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [activeTab, setActiveTab] = useState<"microphone" | "upload">("microphone")

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const interimTranscript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("")

        setLiveTranscript(interimTranscript.toLowerCase().trim())

        // Get final transcript
        const finalTranscript = Array.from(event.results)
          .filter((result) => result.isFinal)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("")

        if (finalTranscript) {
          setTranscript(finalTranscript.toLowerCase().trim())
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setIsRecording(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startRecording = () => {
    setTranscript("")
    setLiveTranscript("")
    setResult(null)
    setShowAnswer(false)
    setIsEditing(false)

    if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsRecording(true)
    } else {
      alert("Speech recognition is not supported in your browser.")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      // Use the final transcript or the live transcript if no final is available
      const finalText = transcript || liveTranscript
      setTranscript(finalText)
      setEditedTranscript(finalText)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "audio/wav") {
      setAudioFile(file)
      setTranscript("")
      setLiveTranscript("")
      setResult(null)
      setShowAnswer(false)
      setIsEditing(false)

      // Simulate processing the audio file
      setIsProcessingFile(true)
      setTimeout(() => {
        // In a real app, you would send the file to a speech-to-text API
        // Here we're just simulating a response
        const simulatedTranscript = "simulated response for " + currentQuestion.kinyarwanda
        setTranscript(simulatedTranscript)
        setEditedTranscript(simulatedTranscript)
        setIsProcessingFile(false)
      }, 2000)
    } else {
      alert("Please upload a WAV file.")
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const checkAnswer = () => {
    const userAnswer = isEditing ? editedTranscript.toLowerCase().trim() : transcript.toLowerCase().trim()
    const correctAnswer = currentQuestion.kinyarwanda.toLowerCase().trim()

    // Simple string comparison - could be enhanced with fuzzy matching
    if (userAnswer === correctAnswer) {
      setResult("correct")
      setScore(score + 1)
    } else {
      setResult("wrong")
    }

    setShowAnswer(true)
    setIsEditing(false)
  }

  const startEditing = () => {
    setIsEditing(true)
    setEditedTranscript(transcript)
  }

  const saveEditing = () => {
    setTranscript(editedTranscript)
    setIsEditing(false)
  }

  const nextQuestion = () => {
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentQuestionIndex((prevIndex) => (prevIndex === questions.length - 1 ? 0 : prevIndex + 1))
      setTranscript("")
      setLiveTranscript("")
      setResult(null)
      setShowAnswer(false)
      setIsTransitioning(false)
      setAudioFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }, 300)
  }

  return (
    <div className="max-w-md mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-400 font-poppins">Kinyarwanda</h1>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-green-300 dark:border-green-700 shadow-sm">
            <span className="font-semibold text-green-800 dark:text-green-400">Score: {score}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-green-700 dark:text-green-400 mb-1">
          <span>
            Question {currentQuestionIndex + 1}/{questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress
          value={progress}
          className="h-2 bg-green-100 dark:bg-green-900"
          indicatorClassName="bg-green-500 dark:bg-green-400"
        />
      </div>

      <div
        className={`transition-all duration-300 ${isTransitioning ? "opacity-0 transform translate-y-4" : "opacity-100"}`}
      >
        <Card className="p-6 mb-8 border-2 border-green-400 dark:border-green-700 bg-white dark:bg-gray-800 shadow-md rounded-xl">
          <h2 className="text-xl text-center mb-2 text-green-700 dark:text-green-400 font-poppins">
            Translate to Kinyarwanda
          </h2>
          <p className="text-2xl md:text-3xl text-center font-bold text-green-800 dark:text-green-300 font-poppins">
            "{currentQuestion.english}"
          </p>
        </Card>

        <div className="space-y-5">
          <Tabs defaultValue="microphone" onValueChange={(value) => setInputMethod(value as "microphone" | "file")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="microphone">Microphone</TabsTrigger>
              <TabsTrigger value="file">Upload Audio</TabsTrigger>
            </TabsList>

            <TabsContent value="microphone" className="space-y-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="w-full py-8 text-lg bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white flex items-center justify-center gap-3 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg font-poppins"
                >
                  <Mic className="h-6 w-6" />
                  Record Your Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={stopRecording}
                    className="w-full py-8 text-lg bg-green-200 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700 text-green-800 dark:text-green-200 flex items-center justify-center gap-3 rounded-xl shadow-md pulse-animation font-poppins"
                  >
                    <Check className="h-6 w-6" />
                    Done Recording
                  </Button>

                  {/* Live transcription feedback */}
                  {liveTranscript && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-red-500 live-indicator ml-4">LIVE</span>
                      </div>
                      <div className="audio-visualizer mb-2">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="audio-bar dark:bg-green-400" />
                        ))}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Listening...</p>
                      <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{liveTranscript}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <input type="file" ref={fileInputRef} accept="audio/wav" onChange={handleFileUpload} className="hidden" />
              <Button
                onClick={triggerFileUpload}
                className="w-full py-8 text-lg bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white flex items-center justify-center gap-3 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg font-poppins"
                disabled={isProcessingFile}
              >
                <Upload className="h-6 w-6" />
                {audioFile ? "Change Audio File" : "Upload WAV File"}
              </Button>

              {audioFile && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">File uploaded:</p>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{audioFile.name}</p>

                  {isProcessingFile && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Processing audio...</p>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 dark:bg-green-400 h-2 rounded-full animate-pulse"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {transcript && !isRecording && !isProcessingFile && (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-green-200 dark:border-green-800 shadow-sm slide-in">
              <div className="flex justify-between items-center mb-1">
                <p className="text-gray-500 dark:text-gray-400 text-sm">You said:</p>
                {!isEditing ? (
                  <Button variant="ghost" size="sm" onClick={startEditing} className="h-8 px-2">
                    <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={saveEditing} className="h-8 px-2">
                    <Save className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </Button>
                )}
              </div>

              {!isEditing ? (
                <p className="text-xl font-medium text-gray-800 dark:text-gray-200">{transcript}</p>
              ) : (
                <Textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="mt-1 text-lg"
                  rows={2}
                />
              )}

              {!showAnswer && !isEditing && (
                <Button
                  onClick={checkAnswer}
                  className="w-full mt-3 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200"
                >
                  Check Answer
                </Button>
              )}
            </div>
          )}

          {result && (
            <div
              className={`p-5 rounded-xl shadow-sm fade-in ${
                result === "correct"
                  ? "bg-green-100 border border-green-300 dark:bg-green-900/50 dark:border-green-800"
                  : "bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {result === "correct" ? (
                  <>
                    <div className="bg-green-500 dark:bg-green-600 rounded-full p-1">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-bold text-green-700 dark:text-green-400 text-lg">Correct!</p>
                  </>
                ) : (
                  <>
                    <div className="bg-red-500 dark:bg-red-600 rounded-full p-1">
                      <X className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-bold text-red-600 dark:text-red-400 text-lg">Wrong!</p>
                  </>
                )}
              </div>

              {result === "wrong" && showAnswer && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">The correct answer is:</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xl font-bold text-green-800 dark:text-green-400">
                      {currentQuestion.kinyarwanda}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-700 dark:text-green-400 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/50"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showAnswer && (
            <Button
              onClick={nextQuestion}
              className="w-full py-4 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 flex items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md font-poppins"
            >
              Next Question
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
