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
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const isListeningRef = useRef(false); // Track intent reliably

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // CHANGED: Easier to manage manually
      recognition.interimResults = true; 
      recognition.lang = 'en-US';

      recognition.onresult = async (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Log for debugging
        if (interimTranscript) console.log("Interim:", interimTranscript);
        if (finalTranscript) console.log("Final:", finalTranscript);

        if (finalTranscript.trim().length > 0) {
             console.log("Captured Final:", finalTranscript);
             await handleUserResponse(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error key:', event.error);
        
        // Ignore "no-speech" errors, just restart
        if (event.error === 'no-speech') {
            return; 
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setIsListening(false);
            isListeningRef.current = false;
        }
      };
      
      recognition.onend = () => {
        console.log("Speech Recognition Ended. Intent:", isListeningRef.current);
        // Immediate restart if we still want to listen
        if (isListeningRef.current) {
            console.log("Restarting Speech Recognition...");
            try {
                recognition.start();
            } catch (e) {
                console.log("Restart failed", e);
            }
        } else {
            setIsListening(false);
        }
      };

      recognitionRef.current = recognition;

    } else {
      alert("Browser not supported for Web Speech API");
    }

    return () => {
      // Cleanup happens in the main cleanup block
    };
  }, []); 

  // ... speak function ...



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
      console.log("Sending to backend:", { message: text, history: updatedHistory });

      // 2. Send to Backend
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: text,
        history: updatedHistory
      });

      console.log("Backend response:", response.data);
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
    isListeningRef.current = false; // Stop intent
    setIsListening(false);
    setIsSpeaking(false);
    synthRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const toggleMic = () => {
    console.log("Toggle Mic Clicked. Current:", isListening, "Ref:", isListeningRef.current);
    if (isListening) {
      isListeningRef.current = false; // Update intent
      setIsListening(false); // Update UI immediately
      recognitionRef.current.stop();
    } else {
      isListeningRef.current = true; // Update intent
      setIsListening(true); // Update UI
      try {
        recognitionRef.current.start();
        console.log("Recognition Started manually");
      } catch (e) {
        console.error("Start failed:", e);
      }
    }
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
             {/* Simple ref to auto-scroll could go here */}
        </div>

        {/* Visualizer Area (Smaller now) */}
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
        
        {/* ... Manual Input Form ... */}

        {/* Debug: Manual Input */}
        {isActive && (
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem('manualInput') as HTMLInputElement);
                    if (input.value.trim()) {
                        handleUserResponse(input.value);
                        input.value = '';
                        setIsListening(false);
                    }
                }}
                className="mt-6 w-full max-w-md flex gap-2"
            >
                <input 
                    name="manualInput"
                    type="text" 
                    placeholder="Type your answer manually (debug mode)"
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
