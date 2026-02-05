
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AudioVisualizer from './AudioVisualizer';
import Controls from './Controls';
import type { InterviewConfig } from './InterviewSetup';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface InterviewSessionProps {
    config: InterviewConfig;
    onEndSession: (feedbackData: any) => void;
}

const InterviewSession = ({ config, onEndSession }: InterviewSessionProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  
  // Refs for Web APIs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      synthRef.current.cancel();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());

        if (audioBlob.size > 0) {
            await processAudio(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
      try {
          console.log("Transcribing audio...", audioBlob.size, "bytes");
          // Optionally show a "Thinking..." state here

          const formData = new FormData();
          formData.append('audio', audioBlob, 'input.webm');

          const transResponse = await axios.post('http://localhost:5000/api/chat/transcribe', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });

          const text = transResponse.data.text;
          console.log("Transcribed Text:", text);

          if (text && text.trim().length > 0) {
              await handleUserResponse(text);
          } else {
              console.log("No speech detected");
              // Maybe speak "I didn't catch that?"
          }

      } catch (error) {
          console.error("Transcription failed", error);
      }
  };

  const toggleMic = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const speak = (text: string) => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to pick a better voice
    const voices = window.speechSynthesis.getVoices();
    // Default priority: Configured voice -> Google US -> First available
    let preferredVoice = voices.find(v => v.voiceURI === config.selectedVoiceURI);
    
    if (!preferredVoice) {
         preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
    }
    
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const handleUserResponse = async (text: string) => {
    // 1. Add User Message to State
    const newUserMsg: Message = { role: 'user', content: text };
    const updatedHistory = [...transcript, newUserMsg];
    setTranscript(updatedHistory);

    try {
      console.log("Sending to backend:", { message: text });

      // 2. Send to Backend
      // We send 'transcript' (previous history) because the backend appends 'message' to it.
      // If we sent 'updatedHistory', the last message would appear twice.
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: text,
        history: transcript,
        context: config 
      });

      const aiText = response.data.response;
      
      // 3. Add AI Message to State
      const newAiMsg: Message = { role: 'assistant', content: aiText };
      setTranscript(prev => [...prev, newAiMsg]);

      // 4. Speak Response
      speak(aiText);

    } catch (error) {
      console.error("Error communicating with backend:", error);
    }
  };

  const startSession = () => {
    setIsActive(true);
    // Initial greeting
    const greeting = `Hello! I'm your AI Interviewer for the ${config.role} position. Please introduce yourself.`;
    const initialMsg: Message = { role: 'assistant', content: greeting };
    setTranscript([initialMsg]);
    speak(greeting);
  };

  const endSession = async () => {
    setIsActive(false);
    stopRecording();
    setIsSpeaking(false);
    synthRef.current.cancel();

    // Generate Feedback
    try {
        const response = await axios.post('http://localhost:5000/api/chat/feedback', {
            history: transcript,
            context: config
        });
        onEndSession(response.data); 
    } catch (error) {
        console.error("Failed to generate feedback:", error);
        onEndSession(null); // Fallback if fails
    }
  };

  const [viewMode, setViewMode] = useState<'visual' | 'transcript'>('visual');

  return (
    <div className="w-screen flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center min-h-[600px] max-h-[90vh] overflow-hidden border border-gray-700">
        
        {/* Header with Toggle */}
        <div className="w-full flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                AI Interviewer
                </h1>
                <p className="text-gray-400 text-sm">Role: <span className="text-blue-400">{config.role}</span></p>
            </div>
            
            <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                    onClick={() => setViewMode('visual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'visual' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Interviewer
                </button>
                <button
                    onClick={() => setViewMode('transcript')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'transcript' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Transcript
                </button>
            </div>
        </div>
        
        {/* Main Content Area */}
        <div className="w-full flex-1 flex flex-col relative overflow-hidden mb-6 border border-gray-700/50 rounded-xl bg-gray-900/30">
            
            {/* Visual Mode */}
            {viewMode === 'visual' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in p-6">
                    <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                        {/* Avatar Image */}
                        <div className={`w-full h-full rounded-full overflow-hidden border-4 border-gray-700 shadow-2xl ${isSpeaking ? 'ring-4 ring-blue-500/50 scale-[1.02] transition-all duration-300' : ''}`}>
                             <img 
                                src={config.selectedAvatar || "https://via.placeholder.com/300"} 
                                alt="AI Interviewer" 
                                className="w-full h-full object-cover"
                             />
                        </div>
                        
                        {/* Status Indicator */}
                        <div className={`absolute bottom-4 right-8 w-6 h-6 rounded-full border-2 border-gray-800 ${isSpeaking ? 'bg-green-500 animate-pulse' : isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    </div>

                    {/* Visualizer Overlay */}
                    <div className="w-full max-w-md h-24">
                        <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} />
                    </div>
                </div>
            )}

            {/* Transcript Mode */}
            {viewMode === 'transcript' && (
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-4 animate-fade-in">
                    {transcript.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-gray-700 text-gray-200 rounded-bl-none border border-gray-600'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <Controls 
          isActive={isActive} 
          isListening={isListening} 
          onStart={startSession} 
          onEnd={endSession} 
          onToggleMic={toggleMic} 
        />
        
        {/* Debug: Manual Input (Always visible for testing if active) */}
        {isActive && (
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem('manualInput') as HTMLInputElement);
                    if (input.value.trim()) {
                        handleUserResponse(input.value);
                        input.value = '';
                    }
                }}
                className="mt-6 w-full max-w-md flex gap-2"
            >
                <input 
                    name="manualInput"
                    type="text" 
                    placeholder="Type answer manually..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                />
                <button 
                    type="submit"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                    Send
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;
