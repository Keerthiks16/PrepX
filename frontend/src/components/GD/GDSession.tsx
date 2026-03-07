import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LogOut, MessageSquare, Volume2, Info, Send, User, Mic, MicOff, Loader2 } from 'lucide-react';
import type { GDConfig } from './GDSetup';

export type GDMessage = {
    role: 'user' | 'assistant' | 'system' | 'mediator';
    sender: string;
    content: string;
};

interface GDSessionProps {
    config: GDConfig;
    userName: string;
    onEndSession: (transcript: GDMessage[]) => void;
}

const GDSession = ({ config, userName, onEndSession }: GDSessionProps) => {
    const [transcript, setTranscript] = useState<GDMessage[]>([]);
    const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    
    // Use refs for values that need to be accessed in callbacks without stale state issues
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const speakerIndexRef = useRef(-1);
    const botCountSinceUserRef = useRef(0);
    const transcriptRef = useRef<GDMessage[]>([]);

    const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
    const participantVoices = useRef<Record<string, SpeechSynthesisVoice>>({});
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            synthRef.current.cancel();
        };
    }, []);

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            const englishVoices = voices.filter(v => v.lang.includes('en'));
            
            config.participants.forEach((p, idx) => {
                participantVoices.current[p.name] = englishVoices[idx % englishVoices.length] || voices[0];
            });
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, [config.participants]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [transcript]);

    const speak = (text: string, sender: string, onEnd?: () => void) => {
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (participantVoices.current[sender]) {
            utterance.voice = participantVoices.current[sender];
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => {
            setActiveSpeaker(sender);
        };
        utterance.onend = () => {
            setActiveSpeaker(null);
            if (onEnd) onEnd();
        };
        synthRef.current.speak(utterance);
    };

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
        setIsProcessingAudio(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'input.webm');
            const transResponse = await axios.post('http://localhost:5000/api/chat/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const text = transResponse.data.text;
            if (text && text.trim().length > 0) {
                handleUserSubmit(text);
            }
        } catch (error) {
            console.error("Transcription failed:", error);
        } finally {
            setIsProcessingAudio(false);
        }
    };

    const toggleMic = () => {
        if (isListening) stopRecording();
        else startRecording();
    };

    const startSession = async () => {
        setIsSessionActive(true);
        try {
            const response = await axios.post('http://localhost:5000/api/chat/gd-intro', { topic: config.topic });
            const intro = response.data.response;
            const msg: GDMessage = { role: 'mediator', sender: 'Mediator', content: intro };
            
            transcriptRef.current = [msg];
            setTranscript([msg]);
            
            speak(intro, 'Mediator', () => {
                if (config.startWithMe) {
                    setActiveSpeaker('User');
                    botCountSinceUserRef.current = 0;
                } else {
                    getNextBotResponse();
                }
            });
        } catch (error) {
            console.error("Failed to start GD:", error);
        }
    };

    const getNextBotResponse = async () => {
        // Check if it's user's turn
        if (botCountSinceUserRef.current >= config.userSpeakerFrequency) {
            setActiveSpeaker('User');
            return;
        }

        // Increment speaker index for queue (Looping)
        speakerIndexRef.current = (speakerIndexRef.current + 1) % config.participants.length;
        const currentBot = config.participants[speakerIndexRef.current];

        try {
            const response = await axios.post('http://localhost:5000/api/chat/gd-chat', {
                topic: config.topic,
                history: transcriptRef.current.map(m => ({ 
                    role: m.role === 'user' ? 'user' : 'assistant', 
                    content: `${m.sender}: ${m.content}` 
                })),
                currentSpeaker: currentBot
            });

            const aiText = response.data.response;
            const newMsg: GDMessage = { role: 'assistant', sender: currentBot.name, content: aiText };
            
            transcriptRef.current = [...transcriptRef.current, newMsg];
            setTranscript([...transcriptRef.current]);
            botCountSinceUserRef.current += 1;

            speak(aiText, currentBot.name, () => {
                setTimeout(() => {
                    getNextBotResponse();
                }, 1500); // Slight pause between speakers
            });
        } catch (error) {
            console.error("GD Chat Error:", error);
            // On error, maybe skip to next bot or give user a chance
            setActiveSpeaker('User');
        }
    };

    const handleUserSubmit = (text: string) => {
        if (!text.trim()) return;
        const userMsg: GDMessage = { role: 'user', sender: userName, content: text };
        
        transcriptRef.current = [...transcriptRef.current, userMsg];
        setTranscript([...transcriptRef.current]);
        botCountSinceUserRef.current = 0; // Reset count
        setActiveSpeaker(null); // Clear user turn
        
        // Resume bot queue after user speaks
        setTimeout(() => {
            getNextBotResponse();
        }, 2000);
    };

    const handlePassFloor = () => {
        if (activeSpeaker !== 'User') return;
        
        botCountSinceUserRef.current = 0; // Reset count
        setActiveSpeaker(null); // Clear user turn
        
        // Resume bot queue immediately
        setTimeout(() => {
            getNextBotResponse();
        }, 1000);
    };

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen bg-base-900 text-text-primary p-4">
             <div className="max-w-6xl w-full h-[85vh] bg-base-800 rounded-2xl shadow-2xl flex flex-col border border-base-600 overflow-hidden relative">
                
                {/* Header */}
                <div className="p-6 border-b border-base-600/50 flex justify-between items-center bg-base-900/50 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-accent-200 to-accent text-transparent bg-clip-text">
                            Topic: {config.topic}
                        </h2>
                        <div className="flex gap-4 text-[10px] text-text-secondary mt-1 font-bold uppercase tracking-wider">
                            <span>{config.participants.length} AI Participants</span>
                            <span className="text-base-600">|</span>
                            <span>Queue Mode: Sequential</span>
                            <span className="text-base-600">|</span>
                            <span>Speaker Freq: {config.userSpeakerFrequency}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {!isSessionActive && (
                            <button 
                                onClick={startSession}
                                className="px-6 py-2 bg-accent text-base-900 font-bold rounded-lg hover:bg-accent-200 transition-all shadow-[0_0_15px_rgba(0,184,148,0.4)]"
                            >
                                Start GD
                            </button>
                        )}
                        <button 
                            onClick={() => onEndSession(transcript)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-all text-sm font-bold"
                        >
                            <LogOut className="w-4 h-4" /> End session
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side: Participant Cards */}
                    <div className="w-72 border-r border-base-600/30 p-4 bg-base-900/30 hidden lg:block overflow-y-auto custom-scrollbar">
                        <h3 className="text-[10px] font-bold text-text-secondary mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                             Live Floor Status
                        </h3>
                        <div className="space-y-3">
                             <div className={`p-4 rounded-xl border transition-all duration-500 ${activeSpeaker === 'User' ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(0,184,148,0.1)] scale-105' : 'border-base-600/20 bg-base-900/50 opacity-40 grayscale-[50%]'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${activeSpeaker === 'User' ? 'bg-accent text-base-900 shadow-[0_0_10px_rgba(0,184,148,0.5)]' : 'bg-base-700 text-text-secondary'}`}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{userName}</p>
                                        <p className="text-[10px] text-text-secondary uppercase">Candidate (You)</p>
                                    </div>
                                </div>
                                {activeSpeaker === 'User' && (
                                    <div className="mt-3 flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
                                        <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
                                        <span className="text-[10px] font-black text-accent tracking-tighter">YOUR TURN TO SPEAK</span>
                                    </div>
                                )}
                            </div>

                            {config.participants.map((p, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border transition-all duration-500 ${activeSpeaker === p.name ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(0,184,148,0.1)] scale-105' : 'border-base-600/20 bg-base-900/50 opacity-40 grayscale-[50%]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${activeSpeaker === p.name ? 'bg-accent text-base-900 shadow-[0_0_10px_rgba(0,184,148,0.5)]' : 'bg-base-800 text-text-secondary'}`}>
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{p.name}</p>
                                            <p className={`text-[10px] uppercase font-medium ${p.persona === 'Excellent' ? 'text-accent' : p.persona === 'Aggressive' ? 'text-error' : 'text-text-secondary'}`}>
                                                {p.persona}
                                            </p>
                                        </div>
                                    </div>
                                    {activeSpeaker === p.name && (
                                        <div className="mt-3 flex items-center gap-2 h-1.5 bg-base-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-accent animate-[progress_1.5s_infinite_linear]"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Discussion Board */}
                    <div className="flex-1 flex flex-col bg-base-900/10">
                        <div 
                            ref={scrollContainerRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth"
                        >
                            {transcript.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-text-secondary/20 select-none">
                                    <MessageSquare className="w-24 h-24 mb-4 stroke-[1px]" />
                                    <p className="text-sm font-medium tracking-widest uppercase">Waiting for moderator to open the floor...</p>
                                </div>
                            )}
                            {transcript.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group animate-fade-in`}>
                                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1.5 px-2 ${msg.role === 'mediator' ? 'text-blue-400' : msg.role === 'user' ? 'text-accent' : 'text-text-secondary'}`}>
                                        {msg.sender}
                                    </span>
                                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm border transition-all ${
                                        msg.role === 'user' 
                                            ? 'bg-accent/10 border-accent/20 text-text-primary rounded-tr-none' 
                                            : msg.role === 'mediator'
                                            ? 'bg-blue-500/5 border-blue-500/20 text-blue-100 italic rounded-tl-none font-medium'
                                            : 'bg-base-800/80 border-base-600/50 text-text-primary rounded-tl-none group-hover:border-accent/20'
                                    }`}>
                                        <p className="text-[15px] leading-relaxed line-clamp-none">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Control Bar */}
                        <div className="p-6 border-t border-base-600/30 bg-base-900/80 backdrop-blur-xl">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = (e.currentTarget.elements.namedItem('msgInput') as HTMLInputElement);
                                    if (input.value) handleUserSubmit(input.value);
                                    input.value = '';
                                }}
                                className="flex gap-4 items-center"
                            >
                                <div className="flex-1 relative group">
                                    <div className={`absolute -top-10 left-0 px-3 py-1 bg-accent/20 border border-accent/30 rounded-t-lg text-[10px] font-black uppercase tracking-widest text-accent transition-all duration-300 ${activeSpeaker === 'User' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                        Your Floor - Speak Now
                                    </div>
                                    <input 
                                        name="msgInput"
                                        type="text"
                                        disabled={activeSpeaker !== 'User' || isProcessingAudio}
                                        placeholder={isProcessingAudio ? "Transcribing your voice..." : activeSpeaker === 'User' ? "Share your viewpoint..." : "Wait for your turn in the queue..."}
                                        className="w-full bg-base-900/50 border border-base-600 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-inner group-hover:border-base-500"
                                        autoComplete="off"
                                    />
                                    {(activeSpeaker === 'User' || isProcessingAudio) && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                            {isProcessingAudio ? (
                                                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                                            ) : (
                                                <div className="flex gap-1">
                                                    <div className="w-1 h-3 bg-accent animate-bounce" style={{ animationDelay: '0s' }}></div>
                                                    <div className="w-1 h-3 bg-accent animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-1 h-3 bg-accent animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {activeSpeaker === 'User' && (
                                    <button 
                                        type="button"
                                        onClick={toggleMic}
                                        className={`p-4 rounded-2xl transition-all shadow-lg active:scale-95 ${isListening ? 'bg-error text-white animate-pulse' : 'bg-base-700 text-accent hover:bg-base-600 border border-base-600'}`}
                                        title={isListening ? "Stop Recording" : "Record Voice"}
                                    >
                                        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                    </button>
                                )}

                                <button 
                                    type="submit"
                                    disabled={activeSpeaker !== 'User' || isProcessingAudio}
                                    className="p-4 bg-accent text-base-900 rounded-2xl hover:bg-accent-200 transition-all shadow-[0_0_20px_rgba(0,184,148,0.3)] active:scale-95 disabled:opacity-40 disabled:grayscale"
                                    title="Send Message"
                                >
                                    <Send className="w-6 h-6" />
                                </button>
                                
                                {activeSpeaker === 'User' && (
                                    <button 
                                        type="button"
                                        onClick={handlePassFloor}
                                        className="h-full px-6 bg-base-700 text-text-primary rounded-2xl hover:bg-base-600 transition-all border border-base-500 font-bold text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-1 min-w-[100px]"
                                    >
                                        <User className="w-4 h-4 text-accent" />
                                        Pass Floor
                                    </button>
                                )}
                            </form>
                            <div className="mt-4 flex items-center justify-center gap-6 opacity-30 select-none">
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                    <Info className="w-3 h-3" />
                                    Sequential Queue System
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                    <Volume2 className="w-3 h-3" />
                                    Multi-Voice Enabled
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default GDSession;
