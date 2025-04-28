// "use client"

// import type React from "react"

// import { useState, useEffect, useRef } from "react"
// import { ArrowRight, Mic, Check, X, Volume2, Upload, Edit2, Save } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Textarea } from "@/components/ui/textarea"
// import { ThemeToggle } from "@/components/theme-toggle"

// // Sample questions - in a real app, this would come from a database or API
// const questions = [
//   {
//     id: 1,
//     english: "to read",
//     kinyarwanda: "gusoma",
//   },
//   {
//     id: 2,
//     english: "to write",
//     kinyarwanda: "kwandika",
//   },
//   {
//     id: 3,
//     english: "to speak",
//     kinyarwanda: "kuvuga",
//   },
//   {
//     id: 4,
//     english: "to listen",
//     kinyarwanda: "kumva",
//   },
//   {
//     id: 5,
//     english: "to eat",
//     kinyarwanda: "kurya",
//   },
//   {
//     id: 6,
//     english: "to drink",
//     kinyarwanda: "kunywa",
//   },
//   {
//     id: 7,
//     english: "to sleep",
//     kinyarwanda: "kuryama",
//   },
//   {
//     id: 8,
//     english: "to walk",
//     kinyarwanda: "kugenda",
//   },
// ]

// // Declare SpeechRecognition
// declare var SpeechRecognition: any
// declare var webkitSpeechRecognition: any

// export default function TranslationGame() {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
//   const [score, setScore] = useState(0)
//   const [isRecording, setIsRecording] = useState(false)
//   const [transcript, setTranscript] = useState("")
//   const [liveTranscript, setLiveTranscript] = useState("")
//   const [result, setResult] = useState<"correct" | "wrong" | null>(null)
//   const [showAnswer, setShowAnswer] = useState(false)
//   const [isTransitioning, setIsTransitioning] = useState(false)
//   const [isEditing, setIsEditing] = useState(false)
//   const [editedTranscript, setEditedTranscript] = useState("")
//   const [inputMethod, setInputMethod] = useState<"microphone" | "file">("microphone")
//   const [audioFile, setAudioFile] = useState<File | null>(null)
//   const [isProcessingFile, setIsProcessingFile] = useState(false)
//   const [activeTab, setActiveTab] = useState<"microphone" | "upload">("microphone")

//   const recognitionRef = useRef<SpeechRecognition | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const currentQuestion = questions[currentQuestionIndex]
//   const progress = ((currentQuestionIndex + 1) / questions.length) * 100

//   useEffect(() => {
//     // Initialize speech recognition
//     if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
//       recognitionRef.current = new SpeechRecognition()
//       recognitionRef.current.continuous = true
//       recognitionRef.current.interimResults = true

//       recognitionRef.current.onresult = (event) => {
//         const interimTranscript = Array.from(event.results)
//           .map((result) => result[0])
//           .map((result) => result.transcript)
//           .join("")

//         setLiveTranscript(interimTranscript.toLowerCase().trim())

//         // Get final transcript
//         const finalTranscript = Array.from(event.results)
//           .filter((result) => result.isFinal)
//           .map((result) => result[0])
//           .map((result) => result.transcript)
//           .join("")

//         if (finalTranscript) {
//           setTranscript(finalTranscript.toLowerCase().trim())
//         }
//       }

//       recognitionRef.current.onerror = (event) => {
//         console.error("Speech recognition error", event.error)
//         setIsRecording(false)
//       }
//     }

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop()
//       }
//     }
//   }, [])

//   const startRecording = () => {
//     setTranscript("")
//     setLiveTranscript("")
//     setResult(null)
//     setShowAnswer(false)
//     setIsEditing(false)

//     if (recognitionRef.current) {
//       recognitionRef.current.start()
//       setIsRecording(true)
//     } else {
//       alert("Speech recognition is not supported in your browser.")
//     }
//   }

//   const stopRecording = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop()
//       setIsRecording(false)
//       // Use the final transcript or the live transcript if no final is available
//       const finalText = transcript || liveTranscript
//       setTranscript(finalText)
//       setEditedTranscript(finalText)
//     }
//   }

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file && file.type === "audio/wav") {
//       setAudioFile(file)
//       setTranscript("")
//       setLiveTranscript("")
//       setResult(null)
//       setShowAnswer(false)
//       setIsEditing(false)

//       // Simulate processing the audio file
//       setIsProcessingFile(true)
//       setTimeout(() => {
//         // In a real app, you would send the file to a speech-to-text API
//         // Here we're just simulating a response
//         const simulatedTranscript = "simulated response for " + currentQuestion.kinyarwanda
//         setTranscript(simulatedTranscript)
//         setEditedTranscript(simulatedTranscript)
//         setIsProcessingFile(false)
//       }, 2000)
//     } else {
//       alert("Please upload a WAV file.")
//     }
//   }

//   const triggerFileUpload = () => {
//     fileInputRef.current?.click()
//   }

//   const checkAnswer = () => {
//     const userAnswer = isEditing ? editedTranscript.toLowerCase().trim() : transcript.toLowerCase().trim()
//     const correctAnswer = currentQuestion.kinyarwanda.toLowerCase().trim()

//     // Simple string comparison - could be enhanced with fuzzy matching
//     if (userAnswer === correctAnswer) {
//       setResult("correct")
//       setScore(score + 1)
//     } else {
//       setResult("wrong")
//     }

//     setShowAnswer(true)
//     setIsEditing(false)
//   }

//   const startEditing = () => {
//     setIsEditing(true)
//     setEditedTranscript(transcript)
//   }

//   const saveEditing = () => {
//     setTranscript(editedTranscript)
//     setIsEditing(false)
//   }

//   const nextQuestion = () => {
//     setIsTransitioning(true)

//     setTimeout(() => {
//       setCurrentQuestionIndex((prevIndex) => (prevIndex === questions.length - 1 ? 0 : prevIndex + 1))
//       setTranscript("")
//       setLiveTranscript("")
//       setResult(null)
//       setShowAnswer(false)
//       setIsTransitioning(false)
//       setAudioFile(null)
//       if (fileInputRef.current) {
//         fileInputRef.current.value = ""
//       }
//     }, 300)
//   }

//   return (
//     <div className="max-w-md mx-auto p-4 md:p-6">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-400 font-poppins">Kinyarwanda</h1>
//         <div className="flex items-center gap-3">
//           <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-green-300 dark:border-green-700 shadow-sm">
//             <span className="font-semibold text-green-800 dark:text-green-400">Score: {score}</span>
//           </div>
//           <ThemeToggle />
//         </div>
//       </div>

//       <div className="mb-4">
//         <div className="flex justify-between text-xs text-green-700 dark:text-green-400 mb-1">
//           <span>
//             Question {currentQuestionIndex + 1}/{questions.length}
//           </span>
//           <span>{Math.round(progress)}% Complete</span>
//         </div>
//         <Progress
//           value={progress}
//           className="h-2 bg-green-100 dark:bg-green-900"
//           indicatorClassName="bg-green-500 dark:bg-green-400"
//         />
//       </div>

//       <div
//         className={`transition-all duration-300 ${isTransitioning ? "opacity-0 transform translate-y-4" : "opacity-100"}`}
//       >
//         <Card className="p-6 mb-8 border-2 border-green-400 dark:border-green-700 bg-white dark:bg-gray-800 shadow-md rounded-xl">
//           <h2 className="text-xl text-center mb-2 text-green-700 dark:text-green-400 font-poppins">
//             Translate to Kinyarwanda
//           </h2>
//           <p className="text-2xl md:text-3xl text-center font-bold text-green-800 dark:text-green-300 font-poppins">
//             "{currentQuestion.english}"
//           </p>
//         </Card>

//         <div className="space-y-5">
//           <Tabs defaultValue="microphone" onValueChange={(value) => setInputMethod(value as "microphone" | "file")}>
//             <TabsList className="grid w-full grid-cols-2 mb-4">
//               <TabsTrigger value="microphone">Microphone</TabsTrigger>
//               <TabsTrigger value="file">Upload Audio</TabsTrigger>
//             </TabsList>

//             <TabsContent value="microphone" className="space-y-4">
//               {!isRecording ? (
//                 <Button
//                   onClick={startRecording}
//                   className="w-full py-8 text-lg bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white flex items-center justify-center gap-3 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg font-poppins"
//                 >
//                   <Mic className="h-6 w-6" />
//                   Record Your Answer
//                 </Button>
//               ) : (
//                 <div className="space-y-4">
//                   <Button
//                     onClick={stopRecording}
//                     className="w-full py-8 text-lg bg-green-200 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700 text-green-800 dark:text-green-200 flex items-center justify-center gap-3 rounded-xl shadow-md pulse-animation font-poppins"
//                   >
//                     <Check className="h-6 w-6" />
//                     Done Recording
//                   </Button>

//                   {/* Live transcription feedback */}
//                   {liveTranscript && (
//                     <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-800">
//                       <div className="flex items-center mb-2">
//                         <span className="text-sm text-red-500 live-indicator ml-4">LIVE</span>
//                       </div>
//                       <div className="audio-visualizer mb-2">
//                         {[...Array(9)].map((_, i) => (
//                           <div key={i} className="audio-bar dark:bg-green-400" />
//                         ))}
//                       </div>
//                       <p className="text-gray-500 dark:text-gray-400 text-sm">Listening...</p>
//                       <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{liveTranscript}</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="file" className="space-y-4">
//               <input type="file" ref={fileInputRef} accept="audio/wav" onChange={handleFileUpload} className="hidden" />
//               <Button
//                 onClick={triggerFileUpload}
//                 className="w-full py-8 text-lg bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white flex items-center justify-center gap-3 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg font-poppins"
//                 disabled={isProcessingFile}
//               >
//                 <Upload className="h-6 w-6" />
//                 {audioFile ? "Change Audio File" : "Upload WAV File"}
//               </Button>

//               {audioFile && (
//                 <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-800">
//                   <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">File uploaded:</p>
//                   <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{audioFile.name}</p>

//                   {isProcessingFile && (
//                     <div className="mt-2">
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Processing audio...</p>
//                       <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                         <div
//                           className="bg-green-500 dark:bg-green-400 h-2 rounded-full animate-pulse"
//                           style={{ width: "60%" }}
//                         ></div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>

//           {transcript && !isRecording && !isProcessingFile && (
//             <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-green-200 dark:border-green-800 shadow-sm slide-in">
//               <div className="flex justify-between items-center mb-1">
//                 <p className="text-gray-500 dark:text-gray-400 text-sm">You said:</p>
//                 {!isEditing ? (
//                   <Button variant="ghost" size="sm" onClick={startEditing} className="h-8 px-2">
//                     <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
//                   </Button>
//                 ) : (
//                   <Button variant="ghost" size="sm" onClick={saveEditing} className="h-8 px-2">
//                     <Save className="h-4 w-4 text-green-600 dark:text-green-400" />
//                   </Button>
//                 )}
//               </div>

//               {!isEditing ? (
//                 <p className="text-xl font-medium text-gray-800 dark:text-gray-200">{transcript}</p>
//               ) : (
//                 <Textarea
//                   value={editedTranscript}
//                   onChange={(e) => setEditedTranscript(e.target.value)}
//                   className="mt-1 text-lg"
//                   rows={2}
//                 />
//               )}

//               {!showAnswer && !isEditing && (
//                 <Button
//                   onClick={checkAnswer}
//                   className="w-full mt-3 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200"
//                 >
//                   Check Answer
//                 </Button>
//               )}
//             </div>
//           )}

//           {result && (
//             <div
//               className={`p-5 rounded-xl shadow-sm fade-in ${
//                 result === "correct"
//                   ? "bg-green-100 border border-green-300 dark:bg-green-900/50 dark:border-green-800"
//                   : "bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800"
//               }`}
//             >
//               <div className="flex items-center gap-3 mb-2">
//                 {result === "correct" ? (
//                   <>
//                     <div className="bg-green-500 dark:bg-green-600 rounded-full p-1">
//                       <Check className="h-5 w-5 text-white" />
//                     </div>
//                     <p className="font-bold text-green-700 dark:text-green-400 text-lg">Correct!</p>
//                   </>
//                 ) : (
//                   <>
//                     <div className="bg-red-500 dark:bg-red-600 rounded-full p-1">
//                       <X className="h-5 w-5 text-white" />
//                     </div>
//                     <p className="font-bold text-red-600 dark:text-red-400 text-lg">Wrong!</p>
//                   </>
//                 )}
//               </div>

//               {result === "wrong" && showAnswer && (
//                 <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
//                   <p className="text-gray-700 dark:text-gray-300">The correct answer is:</p>
//                   <div className="flex items-center justify-between mt-1">
//                     <p className="text-xl font-bold text-green-800 dark:text-green-400">
//                       {currentQuestion.kinyarwanda}
//                     </p>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-green-700 dark:text-green-400 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/50"
//                     >
//                       <Volume2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {showAnswer && (
//             <Button
//               onClick={nextQuestion}
//               className="w-full py-4 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 flex items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md font-poppins"
//             >
//               Next Question
//               <ArrowRight className="h-4 w-4" />
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// "use client";

// import type React from "react";
// import { useState, useEffect, useRef } from "react";
// import {
//   ArrowRight,
//   Mic,
//   Square,
//   Check,
//   X,
//   Volume2,
//   Upload,
//   Edit2,
//   Save,
//   Info,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import { ThemeToggle } from "@/components/theme-toggle";
// import { cn } from "@/lib/utils";

// // Sample questions - in a real app, this would come from a database or API
// const questions = [
//   {
//     id: 1,
//     english: "Where is Rwanda Coding Academy located?",
//     kinyarwanda: "Rwanda Coding Academy iherereye he?",
//   },
//   {
//     id: 2,
//     english: "What is the capital city of Rwanda?",
//     kinyarwanda: "Umurwa mukuru w'u Rwanda ni uwuhe?",
//   },
//   {
//     id: 3,
//     english: "Where is Kinyarwanda spoken?",
//     kinyarwanda: "Ikinyarwanda ni ururimi ruvugwa he?",
//   },
//   {
//     id: 4,
//     english: "How many people live in Rwanda?",
//     kinyarwanda: "U Rwanda rufite abaturage bangahe?",
//   },
//   {
//     id: 5,
//     english: "What remains before the year ends?",
//     kinyarwanda: "Ni iki gisigaye kugira ngo umwaka urangire?",
//   },
//   {
//     id: 6,
//     english: "When did Rwanda gain independence?",
//     kinyarwanda: "Ni ryari u Rwanda rwabonye ubwigenge?",
//   },
//   {
//     id: 7,
//     english: "Which countries border Rwanda?",
//     kinyarwanda: "Ni ikihe gihugu Rwanda ihana imbibi?",
//   },
//   {
//     id: 8,
//     english: "What is Rwanda's national anthem?",
//     kinyarwanda: "Ni iyihe ndirimbo y'igihugu y'u Rwanda?",
//   },
// ];

// // Declare SpeechRecognition
// declare var SpeechRecognition: any;
// declare var webkitSpeechRecognition: any;

// // API URL - change this to your backend URL
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export default function TranslationGame() {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [score, setScore] = useState(0);
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [liveTranscript, setLiveTranscript] = useState("");
//   const [result, setResult] = useState<"correct" | "wrong" | null>(null);
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedTranscript, setEditedTranscript] = useState("");
//   const [audioFile, setAudioFile] = useState<File | null>(null);
//   const [isProcessingFile, setIsProcessingFile] = useState(false);
//   const [notification, setNotification] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<"microphone" | "upload">(
//     "microphone"
//   );
//   const [responseAudio, setResponseAudio] = useState<string | null>(null);
//   const [matchedAnswer, setMatchedAnswer] = useState<string | null>(null);
//   const [isPlayingAudio, setIsPlayingAudio] = useState(false);
//   const [isBackendProcessing, setIsBackendProcessing] = useState(false);

//   const recognitionRef = useRef<typeof SpeechRecognition | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   const currentQuestion = questions[currentQuestionIndex];
//   const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

//   useEffect(() => {
//     // Initialize speech recognition
//     if (
//       typeof window !== "undefined" &&
//       ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
//     ) {
//       const SpeechRecognition =
//         window.SpeechRecognition || window.webkitSpeechRecognition;
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = true;
//       recognitionRef.current.lang = "rw-RW"; // Set language to Kinyarwanda if available

//       recognitionRef.current.onresult = (event: any) => {
//         const interimTranscript = Array.from(event.results)
//           .map((result) => (result as SpeechRecognitionResult)[0])
//           .map((result) => result.transcript)
//           .join("");

//         setLiveTranscript(interimTranscript.toLowerCase().trim());

//         // Get final transcript
//         const finalTranscript = Array.from(event.results)
//           .filter((result) => (result as SpeechRecognitionResult).isFinal)
//           .map((result) => (result as SpeechRecognitionResult)[0])
//           .map((result) => result.transcript)
//           .join("");

//         if (finalTranscript) {
//           setTranscript(finalTranscript.toLowerCase().trim());
//         }
//       };

//       recognitionRef.current.onerror = (event: Event) => {
//         const errorEvent = event as Event & { error: string };
//         console.error("Speech recognition error", errorEvent.error);
//         setIsRecording(false);
//         showNotification("Speech recognition error. Please try again.");
//       };
//     }

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, []);
//   const startRecording = () => {
//     setTranscript("");
//     setLiveTranscript("");
//     setResult(null);
//     setShowAnswer(false);
//     setIsEditing(false);
//     setMatchedAnswer(null);
//     setResponseAudio(null);

//     if (recognitionRef.current) {
//       recognitionRef.current.start();
//       setIsRecording(true);
//       showNotification("Recording started...");
//     } else {
//       alert("Speech recognition is not supported in your browser.");
//     }
//   };

//   const stopRecording = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       setIsRecording(false);
//       // Use the final transcript or the live transcript if no final is available
//       const finalText = transcript || liveTranscript;
//       setTranscript(finalText);
//       setEditedTranscript(finalText);
//       showNotification("Recording stopped");

//       // Process with backend if we have a transcript
//       if (finalText) {
//         processTranscriptWithBackend(finalText);
//       }
//     }
//   };

//   const processTranscriptWithBackend = async (text: string) => {
//     try {
//       setIsBackendProcessing(true);
//       showNotification("Processing your question...");

//       // Send to backend for matching
//       const formData = new FormData();
//       formData.append("question", text);

//       const response = await fetch(`${API_URL}/match-answer/`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Failed to process question");
//       }

//       const data = await response.json();
//       setMatchedAnswer(data.answer);

//       // Generate speech for the answer
//       await generateSpeechForAnswer(data.answer);
//     } catch (error) {
//       console.error("Error processing with backend:", error);
//       showNotification("Error processing your question. Please try again.");
//     } finally {
//       setIsBackendProcessing(false);
//     }
//   };

//   const generateSpeechForAnswer = async (answer: string) => {
//     try {
//       showNotification("Generating audio response...");
//       const formData = new FormData();
//       formData.append("text", answer);

//       const response = await fetch(`${API_URL}/text-to-speech/`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Failed to generate speech");
//       }

//       // Create a blob URL for the audio
//       const blob = await response.blob();
//       const url = URL.createObjectURL(blob);
//       setResponseAudio(url);
//       showNotification("Audio response ready");
//     } catch (error) {
//       console.error("Error generating speech:", error);
//       showNotification("Error generating speech response.");
//     }
//   };

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setAudioFile(file);
//       setTranscript("");
//       setLiveTranscript("");
//       setResult(null);
//       setShowAnswer(false);
//       setIsEditing(false);
//       setMatchedAnswer(null);
//       setResponseAudio(null);

//       // Process the audio file with the backend
//       setIsProcessingFile(true);
//       showNotification("Processing audio file...");

//       try {
//         const formData = new FormData();
//         formData.append("file", file);

//         const response = await fetch(`${API_URL}/process-audio/`, {
//           method: "POST",
//           body: formData,
//         });

//         if (!response.ok) {
//           throw new Error("Failed to process audio");
//         }

//         const data = await response.json();
//         setTranscript(data.transcription);
//         setEditedTranscript(data.transcription);
//         setMatchedAnswer(data.answer);

//         // Set response audio URL
//         if (data.audio_url) {
//           setResponseAudio(`${API_URL}${data.audio_url}`);
//         }

//         showNotification("Audio processed successfully");
//       } catch (error) {
//         console.error("Error processing audio:", error);
//         showNotification("Error processing audio. Please try again.");
//       } finally {
//         setIsProcessingFile(false);
//       }
//     } else {
//       alert("Please upload a valid audio file.");
//     }
//   };

//   const triggerFileUpload = () => {
//     fileInputRef.current?.click();
//   };

//   const checkAnswer = () => {
//     const userAnswer = isEditing
//       ? editedTranscript.toLowerCase().trim()
//       : transcript.toLowerCase().trim();
//     const correctAnswer = currentQuestion.kinyarwanda.toLowerCase().trim();

//     // Simple string comparison - could be enhanced with fuzzy matching
//     if (userAnswer === correctAnswer) {
//       setResult("correct");
//       setScore(score + 1);
//       showNotification("Correct answer! +1 point");
//     } else {
//       setResult("wrong");
//       showNotification("Wrong answer. Try again!");
//     }

//     setShowAnswer(true);
//     setIsEditing(false);
//   };

//   const startEditing = () => {
//     setIsEditing(true);
//     setEditedTranscript(transcript);
//   };

//   const saveEditing = () => {
//     setTranscript(editedTranscript);
//     setIsEditing(false);
//     showNotification("Transcript edited");

//     // Process edited transcript with backend
//     if (editedTranscript) {
//       processTranscriptWithBackend(editedTranscript);
//     }
//   };

//   const nextQuestion = () => {
//     setIsTransitioning(true);

//     setTimeout(() => {
//       setCurrentQuestionIndex((prevIndex) =>
//         prevIndex === questions.length - 1 ? 0 : prevIndex + 1
//       );
//       setTranscript("");
//       setLiveTranscript("");
//       setResult(null);
//       setShowAnswer(false);
//       setIsTransitioning(false);
//       setAudioFile(null);
//       setMatchedAnswer(null);
//       setResponseAudio(null);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }, 300);
//   };

//   const playResponseAudio = () => {
//     if (responseAudio && audioRef.current) {
//       audioRef.current.src = responseAudio;
//       audioRef.current.play();
//       setIsPlayingAudio(true);
//     }
//   };

//   const showNotification = (message: string) => {
//     setNotification(message);
//     setTimeout(() => {
//       setNotification(null);
//     }, 3000);
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-4 md:p-6 relative top-24">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-400 font-poppins">
//           KinyaTutor
//         </h1>
//         <div className="flex items-center gap-3">
//           <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-green-300 dark:border-green-700 shadow-sm">
//             <span className="font-semibold text-green-800 dark:text-green-400">
//               Score: {score}
//             </span>
//           </div>
//           <ThemeToggle />
//         </div>
//       </div>

//       <div className="mb-4">
//         <div className="flex justify-between text-xs text-green-700 dark:text-green-400 mb-1">
//           <span>
//             Question {currentQuestionIndex + 1}/{questions.length}
//           </span>
//           <span>{Math.round(progress)}% Complete</span>
//         </div>
//         <Progress
//           value={progress}
//           className="h-2 bg-green-100 dark:bg-green-900"
//           indicatorClassName="bg-green-500 dark:bg-green-400"
//         />
//       </div>

//       <div
//         className={`transition-all duration-300 ${
//           isTransitioning ? "opacity-0 transform translate-y-4" : "opacity-100"
//         }`}
//       >
//         <Card className="p-6 mb-8 border-2 border-green-400 dark:border-green-700 bg-white dark:bg-gray-800 shadow-md rounded-xl">
//           <h2 className="text-xl text-center mb-2 text-green-700 dark:text-green-400 font-poppins">
//             Translate to Kinyarwanda
//           </h2>
//           <p className="text-2xl md:text-3xl text-center font-bold text-green-800 dark:text-green-300 font-poppins">
//             "{currentQuestion.english}"
//           </p>
//         </Card>

//         <div className="space-y-5">
//           <Tabs
//             defaultValue="microphone"
//             onValueChange={(value) =>
//               setActiveTab(value as "microphone" | "upload")
//             }
//           >
//             {/* <TabsList className="grid w-full grid-cols-2 mb-4">
//               <TabsTrigger value="microphone">Microphone</TabsTrigger>
//               <TabsTrigger value="upload">Upload Audio</TabsTrigger>
// </TabsList> */}

//             <TabsContent value="microphone" className="space-y-4 pt-3 pb-4">
//               <div className="flex flex-col items-center">
//                 {!isRecording ? (
//                   <>
//                     <button
//                       onClick={startRecording}
//                       className="w-24 h-24 rounded-full bg-transparent border-2 border-green-500 flex items-center justify-center mb-2 glow-button pulse-animation-green focus:outline-none"
//                     >
//                       <Mic className="h-10 w-10 text-green-400" />
//                     </button>
//                     <p className="text-gray-400 dark:text-gray-400 text-sm mt-2 mb-4">
//                       Click to Record Answer
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       onClick={stopRecording}
//                       className="w-24 h-24 rounded-full bg-transparent border-2 border-red-500 flex items-center justify-center mb-2 recording-button pulse-animation focus:outline-none"
//                     >
//                       <Square className="h-8 w-8 text-red-500" />
//                     </button>
//                     <p className="text-gray-400 dark:text-gray-400 text-sm mb-4">
//                       Recording... Click to stop
//                     </p>
//                   </>
//                 )}
//               </div>

//               {/* Live transcription feedback */}
//               {isRecording && liveTranscript && (
//                 <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-800">
//                   <div className="flex items-center mb-2">
//                     <span className="text-sm text-red-500 live-indicator ml-4 relative before:content-[''] before:absolute before:w-2 before:h-2 before:bg-red-500 before:rounded-full before:-left-4 before:top-1/2 before:-translate-y-1/2 before:animate-pulse">
//                       LIVE
//                     </span>
//                   </div>
//                   <div className="audio-visualizer mb-2 flex items-center justify-center gap-1 h-5">
//                     {[...Array(9)].map((_, i) => (
//                       <div
//                         key={i}
//                         className="audio-bar h-full w-1 bg-green-400 dark:bg-green-400 rounded-full"
//                         style={{
//                           animation: `soundBars 0.5s infinite alternate ${
//                             i * 0.1
//                           }s`,
//                         }}
//                       />
//                     ))}
//                   </div>
//                   <p className="text-gray-500 dark:text-gray-400 text-sm">
//                     Listening...
//                   </p>
//                   <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
//                     {liveTranscript}
//                   </p>
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="upload" className="space-y-4 pt-3 pb-10">
//               <div className="flex flex-col items-center">
//                 <button
//                   onClick={triggerFileUpload}
//                   className="flex items-center justify-center gap-2 text-green-400 hover:text-green-300 transition-colors"
//                 >
//                   <Upload className="h-5 w-5" />
//                   Upload Audio File (.wav)
//                 </button>
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   accept="audio/wav"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                 />
//               </div>

//               {audioFile && (
//                 <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-800">
//                   <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">
//                     File uploaded:
//                   </p>
//                   <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
//                     {audioFile.name}
//                   </p>

//                   {isProcessingFile && (
//                     <div className="mt-2">
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         Processing audio...
//                       </p>
//                       <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                         <div
//                           className="bg-green-500 dark:bg-green-400 h-2 rounded-full animate-pulse"
//                           style={{ width: "60%" }}
//                         ></div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </TabsContent>
//             <TabsList className="grid w-full grid-cols-2 mb-4">
//               <TabsTrigger value="microphone">Microphone</TabsTrigger>
//               <TabsTrigger value="upload">Upload Audio</TabsTrigger>
//             </TabsList>
//           </Tabs>

//           {transcript && !isRecording && !isProcessingFile && (
//             <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-green-200 dark:border-green-800 shadow-sm slide-in">
//               <div className="flex justify-between items-center mb-1">
//                 <p className="text-gray-500 dark:text-gray-400 text-sm">
//                   You said:
//                 </p>
//                 {!isEditing ? (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={startEditing}
//                     className="h-8 px-2"
//                   >
//                     <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
//                   </Button>
//                 ) : (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={saveEditing}
//                     className="h-8 px-2"
//                   >
//                     <Save className="h-4 w-4 text-green-600 dark:text-green-400" />
//                   </Button>
//                 )}
//               </div>

//               {!isEditing ? (
//                 <p className="text-xl font-medium text-gray-800 dark:text-gray-200">
//                   {transcript}
//                 </p>
//               ) : (
//                 <Textarea
//                   value={editedTranscript}
//                   onChange={(e) => setEditedTranscript(e.target.value)}
//                   className="mt-1 text-lg"
//                   rows={2}
//                 />
//               )}

//               {!showAnswer && !isEditing && !isBackendProcessing && (
//                 <Button
//                   onClick={checkAnswer}
//                   className="w-full mt-3 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200"
//                 >
//                   Check Answer
//                 </Button>
//               )}
//             </div>
//           )}

//           {/* AI Response Section */}
//           {matchedAnswer && !isProcessingFile && (
//             <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-green-200 dark:border-green-800 shadow-sm slide-in mt-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <div className="bg-green-500 dark:bg-green-600 rounded-full p-1">
//                   <Check className="h-4 w-4 text-white" />
//                 </div>
//                 <p className="text-gray-500 dark:text-gray-400 text-sm">
//                   AI Response:
//                 </p>
//               </div>
//               <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
//                 {matchedAnswer}
//               </p>

//               {responseAudio && (
//                 <Button
//                   onClick={playResponseAudio}
//                   variant="outline"
//                   size="sm"
//                   className="flex items-center gap-2 text-green-600 dark:text-green-400 border-green-300 dark:border-green-800"
//                   disabled={isPlayingAudio}
//                 >
//                   <Volume2 className="h-4 w-4" />
//                   {isPlayingAudio ? "Playing..." : "Listen to Response"}
//                 </Button>
//               )}

//               <audio
//                 ref={audioRef}
//                 onEnded={() => setIsPlayingAudio(false)}
//                 onError={() => {
//                   setIsPlayingAudio(false);
//                   showNotification("Error playing audio response");
//                 }}
//                 className="hidden"
//               />
//             </div>
//           )}

//           {result && (
//             <div
//               className={`p-5 rounded-xl shadow-sm fade-in ${
//                 result === "correct"
//                   ? "bg-green-100 border border-green-300 dark:bg-green-900/50 dark:border-green-800"
//                   : "bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800"
//               }`}
//             >
//               <div className="flex items-center gap-3 mb-2">
//                 {result === "correct" ? (
//                   <>
//                     <div className="bg-green-500 dark:bg-green-600 rounded-full p-1">
//                       <Check className="h-5 w-5 text-white" />
//                     </div>
//                     <p className="font-bold text-green-700 dark:text-green-400 text-lg">
//                       Correct!
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <div className="bg-red-500 dark:bg-red-600 rounded-full p-1">
//                       <X className="h-5 w-5 text-white" />
//                     </div>
//                     <p className="font-bold text-red-600 dark:text-red-400 text-lg">
//                       Wrong!
//                     </p>
//                   </>
//                 )}
//               </div>

//               {result === "wrong" && showAnswer && (
//                 <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
//                   <p className="text-gray-700 dark:text-gray-300">
//                     The correct answer is:
//                   </p>
//                   <div className="flex items-center justify-between mt-1">
//                     <p className="text-xl font-bold text-green-800 dark:text-green-400">
//                       {currentQuestion.kinyarwanda}
//                     </p>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-green-700 dark:text-green-400 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/50"
//                       onClick={() => {
//                         // Generate TTS for the correct answer
//                         if (currentQuestion.kinyarwanda) {
//                           generateSpeechForAnswer(currentQuestion.kinyarwanda);
//                         }
//                       }}
//                     >
//                       <Volume2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {showAnswer && (
//             <Button
//               onClick={nextQuestion}
//               className="w-full py-4 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 flex items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md font-poppins mt-4"
//             >
//               Next Question
//               <ArrowRight className="h-4 w-4" />
//             </Button>
//           )}
//         </div>
//       </div>

//       {notification && (
//         <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in flex items-center gap-2">
//           <Info className="h-4 w-4 text-green-400" />
//           <span>{notification}</span>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes soundBars {
//           0% {
//             height: 10%;
//           }
//           100% {
//             height: 100%;
//           }
//         }

//         .pulse-animation-green {
//           animation: pulseGreen 2s infinite;
//         }

//         @keyframes pulseGreen {
//           0% {
//             box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4);
//           }
//           70% {
//             box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
//           }
//           100% {
//             box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
//           }
//         }

//         .pulse-animation {
//           animation: pulse 1.5s infinite;
//         }

//         @keyframes pulse {
//           0% {
//             box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
//           }
//           70% {
//             box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
//           }
//           100% {
//             box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
//           }
//         }

//         .glow-button {
//           box-shadow: 0 0 15px rgba(74, 222, 128, 0.3);
//         }

//         .recording-button {
//           box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
//         }

//         .slide-in {
//           animation: slideIn 0.3s ease-out;
//         }

//         @keyframes slideIn {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .fade-in {
//           animation: fadeIn 0.3s ease-out;
//         }

//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }

//         .animate-fade-in {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }
















"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowRight, Mic, Square, Check, X, Volume2, Upload, Edit2, Save, Info, MessageSquare, BookOpen, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { matchAnswer, textToSpeech } from "@/lib/api-client"

// Sample questions - in a real app, this would come from a database or API
const questions = [
  {
    id: 1,
    english: "Where is Rwanda Coding Academy located?",
    kinyarwanda: "Rwanda Coding Academy iherereye he?",
  },
  {
    id: 2,
    english: "What is the capital city of Rwanda?",
    kinyarwanda: "Umurwa mukuru w'u Rwanda ni uwuhe?",
  },
  {
    id: 3,
    english: "Where is Kinyarwanda spoken?",
    kinyarwanda: "Ikinyarwanda ni ururimi ruvugwa he?",
  },
  {
    id: 4,
    english: "How many people live in Rwanda?",
    kinyarwanda: "U Rwanda rufite abaturage bangahe?",
  },
  {
    id: 5,
    english: "What remains before the year ends?",
    kinyarwanda: "Ni iki gisigaye kugira ngo umwaka urangire?",
  },
  {
    id: 6,
    english: "When did Rwanda gain independence?",
    kinyarwanda: "Ni ryari u Rwanda rwabonye ubwigenge?",
  },
  {
    id: 7,
    english: "Which countries border Rwanda?",
    kinyarwanda: "Ni ikihe gihugu Rwanda ihana imbibi?",
  },
  {
    id: 8,
    english: "What is Rwanda's national anthem?",
    kinyarwanda: "Ni iyihe ndirimbo y'igihugu y'u Rwanda?",
  },
]

// Declare SpeechRecognition
declare var SpeechRecognition: any
declare var webkitSpeechRecognition: any

// API URL - change this to your backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function TranslationGame() {
  // App mode state
  const [appMode, setAppMode] = useState<"quiz" | "challenge">("quiz")
  
  // Quiz mode states
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
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"microphone" | "upload">("microphone")
  const [responseAudio, setResponseAudio] = useState<string | null>(null)
  const [matchedAnswer, setMatchedAnswer] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isBackendProcessing, setIsBackendProcessing] = useState(false)
  
  // Challenge mode states
  const [userQuestion, setUserQuestion] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{type: "user" | "bot", text: string}>>([])
  const [isProcessingQuestion, setIsProcessingQuestion] = useState(false)
  const [audioAmplitudes, setAudioAmplitudes] = useState<number[]>([])
  const [isVisualizerActive, setIsVisualizerActive] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "rw-RW" // Set language to Kinyarwanda if available

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
        showNotification("Speech recognition error. Please try again.")
      }
    }

    // Initialize audio context for visualizer
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  const startRecording = () => {
    setTranscript("")
    setLiveTranscript("")
    setResult(null)
    setShowAnswer(false)
    setIsEditing(false)
    setMatchedAnswer(null)
    setResponseAudio(null)

    if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsRecording(true)
      showNotification("Recording started...")
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
      showNotification("Recording stopped")
      
      // Process with backend if we have a transcript
      if (finalText) {
        processTranscriptWithBackend(finalText)
      }
    }
  }

  const processTranscriptWithBackend = async (text: string) => {
    try {
      setIsBackendProcessing(true)
      showNotification("Processing your question...")
      
      // Send to backend for matching
      const formData = new FormData()
      formData.append("question", text)
      
      const response = await fetch(`${API_URL}/match-answer/`, {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error("Failed to process question")
      }
      
      const data = await response.json()
      setMatchedAnswer(data.answer)
      
      // Generate speech for the answer
      await generateSpeechForAnswer(data.answer)
      
    } catch (error) {
      console.error("Error processing with backend:", error)
      showNotification("Error processing your question. Please try again.")
    } finally {
      setIsBackendProcessing(false)
    }
  }
  
  const generateSpeechForAnswer = async (answer: string) => {
    try {
      showNotification("Generating audio response...")
      const formData = new FormData()
      formData.append("text", answer)
      
      const response = await fetch(`${API_URL}/text-to-speech/`, {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate speech")
      }
      
      // Create a blob URL for the audio
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setResponseAudio(url)
      showNotification("Audio response ready")
      
    } catch (error) {
      console.error("Error generating speech:", error)
      showNotification("Error generating speech response.")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setTranscript("")
      setLiveTranscript("")
      setResult(null)
      setShowAnswer(false)
      setIsEditing(false)
      setMatchedAnswer(null)
      setResponseAudio(null)

      // Process the audio file with the backend
      setIsProcessingFile(true)
      showNotification("Processing audio file...")
      
      try {
        const formData = new FormData()
        formData.append("file", file)
        
        const response = await fetch(`${API_URL}/process-audio/`, {
          method: "POST",
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error("Failed to process audio")
        }
        
        const data = await response.json()
        setTranscript(data.transcription)
        setEditedTranscript(data.transcription)
        setMatchedAnswer(data.answer)
        
        // Set response audio URL
        if (data.audio_url) {
          setResponseAudio(`${API_URL}${data.audio_url}`)
        }
        
        showNotification("Audio processed successfully")
      } catch (error) {
        console.error("Error processing audio:", error)
        showNotification("Error processing audio. Please try again.")
      } finally {
        setIsProcessingFile(false)
      }
    } else {
      alert("Please upload a valid audio file.")
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
      showNotification("Correct answer! +1 point")
    } else {
      setResult("wrong")
      showNotification("Wrong answer. Try again!")
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
    showNotification("Transcript edited")
    
    // Process edited transcript with backend
    if (editedTranscript) {
      processTranscriptWithBackend(editedTranscript)
    }
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
      setMatchedAnswer(null)
      setResponseAudio(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }, 300)
  }

  const playResponseAudio = () => {
    if (responseAudio && audioRef.current) {
      // Set up audio visualization
      if (audioContextRef.current && analyserRef.current && audioRef.current) {
        const source = audioContextRef.current.createMediaElementSource(audioRef.current)
        source.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)
        
        // Start visualization
        setIsVisualizerActive(true)
        visualizeAudio()
      }
      
      audioRef.current.src = responseAudio
      audioRef.current.play()
      setIsPlayingAudio(true)
    }
  }
  
  const visualizeAudio = () => {
    if (!analyserRef.current) return
    
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const updateVisualizer = () => {
      if (!isVisualizerActive) return
      
      analyserRef.current!.getByteFrequencyData(dataArray)
      
      // Process the data to get amplitudes for visualization
      // We'll take a sample of the frequency data for visualization
      const amplitudes = Array.from({length: 20}, (_, i) => {
        const index = Math.floor(i * (bufferLength / 20))
        return dataArray[index] / 255 // Normalize to 0-1
      })
      
      setAudioAmplitudes(amplitudes)
      
      // Continue updating if still active
      if (isVisualizerActive) {
        requestAnimationFrame(updateVisualizer)
      }
    }
    
    // Start the visualization loop
    updateVisualizer()
  }

  const stopVisualization = () => {
    setIsVisualizerActive(false)
    setAudioAmplitudes([])
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  // Challenge mode functions
  const handleQuestionSubmit = async () => {
    if (!userQuestion.trim()) return
    
    // Add user question to chat
    setChatHistory(prev => [...prev, { type: 'user', text: userQuestion }])
    
    // Process the question
    setIsProcessingQuestion(true)
    
    try {
      // Get answer from backend
      const result = await matchAnswer(userQuestion)
      
      // Add bot response to chat
      setChatHistory(prev => [...prev, { type: 'bot', text: result.answer }])
      
      // Generate speech for the answer
      const audioUrl = await textToSpeech(result.answer)
      setResponseAudio(audioUrl)
      
      // Auto-play the response
      setTimeout(() => {
        if (audioRef.current) {
          // Set up audio visualization
          if (audioContextRef.current && analyserRef.current && audioRef.current) {
            const source = audioContextRef.current.createMediaElementSource(audioRef.current)
            source.connect(analyserRef.current)
            analyserRef.current.connect(audioContextRef.current.destination)
            
            // Start visualization
            setIsVisualizerActive(true)
            visualizeAudio()
          }
          
          audioRef.current.src = audioUrl
          audioRef.current.play()
          setIsPlayingAudio(true)
        }
      }, 500)
      
    } catch (error) {
      console.error("Error processing question:", error)
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: "Sorry, I couldn't process your question. Please try again." 
      }])
    } finally {
      setIsProcessingQuestion(false)
      setUserQuestion("")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 relative top-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-400 font-poppins">KinyaTutor</h1>
        <div className="flex items-center gap-3">
          {appMode === "quiz" && (
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-green-300 dark:border-green-700 shadow-sm">
              <span className="font-semibold text-green-800 dark:text-green-400">Score: {score}</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Mode Selection Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setAppMode("quiz")}
            className={`py-2 px-4 font-medium text-sm transition-colors ${
              appMode === "quiz" 
                ? "text-green-600 dark:text-green-400 border-b-2 border-green-500" 
                : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
            }`}
          >
            <BookOpen className="inline-block mr-2 h-4 w-4" />
            Try KinyaQuiz
          </button>
          <button
            onClick={() => setAppMode("challenge")}
            className={`py-2 px-4 font-medium text-sm transition-colors ${
              appMode === "challenge" 
                ? "text-green-600 dark:text-green-400 border-b-2 border-green-500" 
                : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
            }`}
          >
            <MessageSquare className="inline-block mr-2 h-4 w-4" />
            Challenge Me
          </button>
        </div>
      </div>

      {/* Quiz Mode */}
      {appMode === "quiz" && (
        <>
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
              <Tabs defaultValue="microphone" onValueChange={(value) => setActiveTab(value as "microphone" | "upload")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="microphone">Microphone</TabsTrigger>
                  <TabsTrigger value="upload">Upload Audio</TabsTrigger>
                </TabsList>

                <TabsContent value="microphone" className="space-y-4 mt-5">
                  <div className="flex flex-col items-center">
                    {!isRecording ? (
                      <>
                        <button
                          onClick={startRecording}
                          className="w-24 h-24 rounded-full bg-transparent border-2 border-green-500 flex items-center justify-center mb-2 glow-button pulse-animation-green focus:outline-none"
                        >
                          <Mic className="h-10 w-10 text-green-400" />
                        </button>
                        <p className="text-gray-400 dark:text-gray-400 text-sm mb-4">Click to Record</p>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={stopRecording}
                          className="w-24 h-24 rounded-full bg-transparent border-2 border-red-500 flex items-center justify-center mb-2 recording-button pulse-animation focus:outline-none"
                        >
                          <Square className="h-8 w-8 text-red-500" />
                        </button>
                        <p className="text-gray-400 dark:text-gray-400 text-sm mb-4">Recording... Click to stop</p>
                      </>
                    )}
                  </div>

                  {/* Live transcription feedback */}
                  {isRecording && liveTranscript && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-red-500 live-indicator ml-4 relative before:content-[''] before:absolute before:w-2 before:h-2 before:bg-red-500 before:rounded-full before:-left-4 before:top-1/2 before:-translate-y-1/2 before:animate-pulse">
                          LIVE
                        </span>
                      </div>
                      <div className="audio-visualizer mb-2 flex items-center justify-center gap-1 h-5">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="audio-bar h-full w-1 bg-green-400 dark:bg-green-400 rounded-full" style={{animation: `soundBars 0.5s infinite alternate ${i * 0.1}s`}} />
                        ))}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Listening...</p>
                      <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{liveTranscript}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="space-y-4 pt-3">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={triggerFileUpload}
                      className="flex items-center justify-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      Upload Audio File (.wav)
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="audio/wav"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

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

                  {!showAnswer && !isEditing && !isBackendProcessing && (
                    <Button
                      onClick={checkAnswer}
                      className="w-full mt-3 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200"
                    >
                      Check Answer
                    </Button>
                  )}
                </div>
              )}

              {/* AI Response Section */}
              {matchedAnswer && !isProcessingFile && (
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-green-200 dark:border-green-800 shadow-sm slide-in mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-500 dark:bg-green-600 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">AI Response:</p>
                  </div>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">{matchedAnswer}</p>
                  
                  {responseAudio && (
                    <div>
                      <Button
                        onClick={playResponseAudio}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-green-600 dark:text-green-400 border-green-300 dark:border-green-800 mb-2"
                        disabled={isPlayingAudio}
                      >
                                                <Volume2 className="h-4 w-4" />
                        {isPlayingAudio ? "Playing..." : "Listen to Response"}
                      </Button>
                      
                      {/* Audio Visualizer */}
                      {isPlayingAudio && (
                        <div className="audio-visualizer-container h-8 flex items-center justify-center gap-[2px] mt-2">
                          {audioAmplitudes.map((amplitude, index) => (
                            <div 
                              key={index}
                              className="audio-visualizer-bar bg-green-500 dark:bg-green-400 rounded-full w-1"
                              style={{ 
                                height: `${Math.max(15, amplitude * 100)}%`,
                                animation: `soundBars 0.5s infinite alternate ${index * 0.05}s`
                              }}
                            />
                          ))}
                          {!audioAmplitudes.length && [...Array(20)].map((_, i) => (
                            <div 
                              key={i}
                              className="audio-visualizer-bar bg-green-500 dark:bg-green-400 rounded-full w-1"
                              style={{ 
                                height: `${Math.max(15, Math.random() * 100)}%`,
                                animation: `soundBars 0.5s infinite alternate ${i * 0.05}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <audio 
                    ref={audioRef}
                    onEnded={() => {
                      setIsPlayingAudio(false);
                      stopVisualization();
                    }}
                    onError={() => {
                      setIsPlayingAudio(false);
                      stopVisualization();
                      showNotification("Error playing audio response");
                    }}
                    className="hidden"
                  />
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
                          onClick={() => {
                            // Generate TTS for the correct answer
                            if (currentQuestion.kinyarwanda) {
                              generateSpeechForAnswer(currentQuestion.kinyarwanda);
                            }
                          }}
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
                  className="w-full py-4 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 flex items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md font-poppins mt-4"
                >
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Challenge Mode */}
      {appMode === "challenge" && (
        <div className="space-y-4">
          <Card className="p-6 border-2 border-green-400 dark:border-green-700 bg-white dark:bg-gray-800 shadow-md rounded-xl">
            <h2 className="text-xl text-center mb-2 text-green-700 dark:text-green-400 font-poppins">
              Challenge Me
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              Ask me anything about Kinyarwanda and I'll respond with the translation or answer.
            </p>
            
            {/* Chat History */}
            <div 
              ref={chatContainerRef}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 h-80 overflow-y-auto"
            >
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                  <p>Ask a question to get started</p>
                  <p className="text-sm mt-2">Example: "How do you say 'hello' in Kinyarwanda?"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Audio Visualizer for bot responses */}
                  {isPlayingAudio && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].type === 'bot' && (
                    <div className="flex justify-start">
                      <div className="audio-visualizer-container h-8 flex items-center justify-center gap-[2px] mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                        {audioAmplitudes.map((amplitude, index) => (
                          <div 
                            key={index}
                            className="audio-visualizer-bar bg-green-500 dark:bg-green-400 rounded-full w-1"
                            style={{ 
                              height: `${Math.max(15, amplitude * 100)}%`,
                              animation: `soundBars 0.5s infinite alternate ${index * 0.05}s`
                            }}
                          />
                        ))}
                        {!audioAmplitudes.length && [...Array(20)].map((_, i) => (
                          <div 
                            key={i}
                            className="audio-visualizer-bar bg-green-500 dark:bg-green-400 rounded-full w-1"
                            style={{ 
                              height: `${Math.max(15, Math.random() * 100)}%`,
                              animation: `soundBars 0.5s infinite alternate ${i * 0.05}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isProcessingQuestion && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '600ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="flex gap-2">
              <Textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="flex-grow resize-none rounded-2xl p-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuestionSubmit();
                  }
                }}
              />
              <Button 
                onClick={handleQuestionSubmit}
                className="self-end bg-green-500 hover:bg-green-600 text-white rounded-[5px]"
                disabled={isProcessingQuestion || !userQuestion.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            <audio 
              ref={audioRef}
              onEnded={() => {
                setIsPlayingAudio(false);
                stopVisualization();
              }}
              onError={() => {
                setIsPlayingAudio(false);
                stopVisualization();
                showNotification("Error playing audio response");
              }}
              className="hidden"
            />
          </Card>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in flex items-center gap-2">
          <Info className="h-4 w-4 text-green-400" />
          <span>{notification}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes soundBars {
          0% {
            height: 15%;
          }
          100% {
            height: 100%;
          }
        }
        
        .pulse-animation-green {
          animation: pulseGreen 5s infinite;
        }
        
        @keyframes pulseGreen {
          0% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
          }
        }
        
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        
        .glow-button {
          box-shadow: 0 0 15px rgba(74, 222, 128, 0.3);
        }
        
        .recording-button {
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
        }
        
        .slide-in {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .audio-visualizer-container {
          min-height: 32px;
        }
      `}</style>
    </div>
  )
}