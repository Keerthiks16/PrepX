
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  
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
          const formData = new FormData();
          formData.append('audio', audioBlob, 'input.webm');
          const transResponse = await axios.post('http://localhost:5000/api/chat/transcribe', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          const text = transResponse.data.text;
          if (text && text.trim().length > 0) {
              await handleUserResponse(text);
          }
      } catch (error) {
          console.error("Transcription failed", error);
      }
  };

  const toggleMic = () => {
    if (isListening) stopRecording();
    else startRecording();
  };

  const speak = (text: string) => {
    if (synthRef.current.speaking) synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
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
    const newUserMsg: Message = { role: 'user', content: text };
    setTranscript(prev => [...prev, newUserMsg]);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: text,
        history: transcript,
        context: config 
      });
      const aiText = response.data.response;
      const newAiMsg: Message = { role: 'assistant', content: aiText };
      setTranscript(prev => [...prev, newAiMsg]);
      speak(aiText);
    } catch (error) {
      console.error("Error communicating with backend:", error);
    }
  };

  const startSession = () => {
    setIsActive(true);
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
    try {
        const response = await axios.post('http://localhost:5000/api/chat/feedback', {
            history: transcript,
            context: config
        });
        onEndSession(response.data); 
    } catch (error) {
        console.error("Failed to generate feedback:", error);
        onEndSession(null);
    }
  };

  const [viewMode, setViewMode] = useState<'visual' | 'transcript'>('visual');

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-base-900 text-text-primary p-4">
      <div className="w-full h-full flex-1 flex flex-col bg-base-800 rounded-2xl shadow-xl p-4 md:p-8 border border-base-600 relative overflow-hidden">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text">
                AI Interviewer
                </h1>
                <div className="flex gap-4 text-sm text-text-secondary mt-1">
                    <p>Role: <span className="text-accent-200 font-bold">{config.role}</span></p>
                    <span className="text-base-600">|</span>
                    <p>Type: <span className="text-accent-200 font-bold">{config.interviewType}</span></p>
                </div>
            </div>
            
            <div className="flex bg-base-900 rounded-lg p-1 border border-base-600/30">
                <button
                    onClick={() => setViewMode('visual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'visual' ? 'bg-accent text-base-900 shadow font-bold' : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                    Interviewer
                </button>
                <button
                    onClick={() => setViewMode('transcript')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'transcript' ? 'bg-accent text-base-900 shadow font-bold' : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                    Transcript
                </button>
            </div>
        </div>
        
        {/* Main Content Area */}
        <div className="w-full flex-1 flex flex-col relative overflow-hidden mb-6 border border-base-600/30 rounded-xl bg-base-900/30">
            
            {viewMode === 'visual' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in p-6">
                    <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                        <div className={`w-full h-full rounded-full overflow-hidden border-4 border-base-600 shadow-2xl ${isSpeaking ? 'ring-4 ring-accent/50 scale-[1.02] transition-all duration-300' : ''}`}>
                             <img 
                                src={config.selectedAvatar || "https://via.placeholder.com/300"} 
                                alt="AI Interviewer" 
                                className="w-full h-full object-cover"
                             />
                        </div>
                        <div className={`absolute bottom-4 right-8 w-6 h-6 rounded-full border-2 border-base-900 ${isSpeaking ? 'bg-accent animate-pulse shadow-[0_0_15px_rgba(0,184,148,0.8)]' : isListening ? 'bg-error animate-pulse' : 'bg-base-600'}`}></div>
                    </div>
                    <div className="w-full max-w-md h-24">
                        <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} />
                    </div>
                </div>
            )}

            {viewMode === 'transcript' && (
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-4 animate-fade-in">
                    {transcript.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-xl shadow-md ${
                                msg.role === 'user' 
                                ? 'bg-accent-600 text-white font-medium rounded-br-none' 
                                : 'bg-base-900/80 text-text-primary rounded-bl-none border border-base-600/50'
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
                    className="flex-1 px-4 py-2 bg-base-900 border border-base-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder-text-secondary/30 shadow-inner"
                />
                <button 
                    type="submit"
                    className="px-6 py-2 bg-accent text-base-900 font-bold rounded-lg hover:bg-accent-200 transition-colors shadow-lg"
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
