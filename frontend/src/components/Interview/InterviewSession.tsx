import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AudioVisualizer from './AudioVisualizer';
import Controls from './Controls';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const InterviewSession = () => {
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
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
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
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: text,
        history: updatedHistory
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
    const greeting = "Hello! I'm your AI Interviewer. Please introduce yourself.";
    const initialMsg: Message = { role: 'assistant', content: greeting };
    setTranscript([initialMsg]);
    speak(greeting);
  };

  const endSession = () => {
    setIsActive(false);
    stopRecording();
    setIsSpeaking(false);
    synthRef.current.cancel();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center min-h-[600px] max-h-[90vh] overflow-hidden">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          AI Interviewer
        </h1>
        
        {/* Transcript Area */}
        <div className="w-full flex-1 overflow-y-auto mb-6 p-4 border-b border-gray-100 space-y-4">
            {transcript.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                        {msg.content}
                    </div>
                </div>
            ))}
        </div>

        {/* Visualizer Area */}
        <div className="w-full h-24 flex items-center justify-center bg-gray-50 rounded-xl mb-6 relative overflow-hidden">
             <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} />
        </div>

        <Controls 
          isActive={isActive} 
          isListening={isListening} 
          onStart={startSession} 
          onEnd={endSession} 
          onToggleMic={toggleMic} 
        />
        
        {/* Debug: Manual Input */}
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
                    placeholder="Type your answer manually"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    type="submit"
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
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
