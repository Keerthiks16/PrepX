import { useState, useEffect } from 'react';
import { MessageSquare, Shield, Zap, UserMinus, UserCheck, Settings } from 'lucide-react';

export type GDParticipant = {
    name: string;
    persona: 'Excellent' | 'Aggressive' | 'Neutral' | 'Silent';
    avatar?: string;
};

export type GDConfig = {
    topic: string;
    participants: GDParticipant[];
    userSpeakerFrequency: number; // Speak after N people
    startWithMe: boolean;
};

interface GDSetupProps {
    onStart: (config: GDConfig) => void;
}

const DEFAULT_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Skyler"];

const GDSetup = ({ onStart }: GDSetupProps) => {
    const [topic, setTopic] = useState("");
    const [numParticipants, setNumParticipants] = useState(4);
    const [participants, setParticipants] = useState<GDParticipant[]>([]);
    const [userFrequency, setUserFrequency] = useState(3);
    const [startWithMe, setStartWithMe] = useState(false);

    // Initialize participants on mount
    useEffect(() => {
        updateParticipants(4);
    }, []);

    const updateParticipants = (count: number) => {
        const newParticipants: GDParticipant[] = [];
        const personas: GDParticipant['persona'][] = ['Excellent', 'Aggressive', 'Neutral', 'Silent'];
        
        for (let i = 0; i < count; i++) {
            newParticipants.push({
                name: DEFAULT_NAMES[i % DEFAULT_NAMES.length],
                persona: personas[i % personas.length]
            });
        }
        setParticipants(newParticipants);
    };

    const handlePersonaChange = (index: number, persona: GDParticipant['persona']) => {
        const updated = [...participants];
        updated[index].persona = persona;
        setParticipants(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart({ topic, participants, userSpeakerFrequency: userFrequency, startWithMe });
    };

    const getPersonaIcon = (persona: GDParticipant['persona']) => {
        switch (persona) {
            case 'Excellent': return <UserCheck className="w-4 h-4 text-accent" />;
            case 'Aggressive': return <Zap className="w-4 h-4 text-error" />;
            case 'Neutral': return <Shield className="w-4 h-4 text-blue-400" />;
            case 'Silent': return <UserMinus className="w-4 h-4 text-text-secondary" />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen bg-base-900 text-text-primary p-4">
            <div className="max-w-4xl w-full bg-base-800 rounded-2xl shadow-xl p-8 border border-base-600 my-8">
                <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text">
                    Group Discussion Setup
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">GD Topic</label>
                        <input 
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Is AI a threat to human jobs?"
                            className="w-full px-4 py-3 bg-base-900 border border-base-600 rounded-lg focus:ring-2 focus:ring-accent text-text-primary outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 line-clamp-2">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Number of AI Participants (2-8)</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range"
                                    min="2"
                                    max="8"
                                    value={numParticipants}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setNumParticipants(val);
                                        updateParticipants(val);
                                    }}
                                    className="flex-1 accent-accent"
                                />
                                <span className="text-2xl font-bold text-accent">{numParticipants}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">I will speak after every</label>
                            <select 
                                value={userFrequency}
                                onChange={(e) => setUserFrequency(parseInt(e.target.value))}
                                className="w-full px-4 py-3 bg-base-900 border border-base-600 rounded-lg focus:ring-2 focus:ring-accent text-text-primary outline-none transition-all"
                            >
                                <option value={1}>1 AI Participant</option>
                                <option value={2}>2 AI Participants</option>
                                <option value={3}>3 AI Participants</option>
                                <option value={4}>4 AI Participants</option>
                                <option value={5}>5 AI Participants</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-4 bg-base-900/50 rounded-xl border border-base-600/30 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-accent">Initiative Control</h3>
                            <p className="text-xs text-text-secondary">Decide if you want to open the discussion yourself.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={startWithMe} 
                                onChange={(e) => setStartWithMe(e.target.checked)} 
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-base-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            <span className="ml-3 text-sm font-medium text-text-primary">{startWithMe ? 'Start with me' : 'Bot starts'}</span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-text-secondary flex items-center gap-2">
                             <Settings className="w-4 h-4" />
                             Customize Participants
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {participants.map((p, idx) => (
                                <div key={idx} className="bg-base-900 p-4 rounded-xl border border-base-600/50 flex flex-col gap-3 transition-all hover:border-accent/30">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm">Participant {idx + 1}: {p.name}</span>
                                        <div className="p-1.5 rounded-full bg-base-800">
                                            {getPersonaIcon(p.persona)}
                                        </div>
                                    </div>
                                    <select 
                                        value={p.persona}
                                        onChange={(e) => handlePersonaChange(idx, e.target.value as any)}
                                        className="w-full bg-base-800 border border-base-600/30 rounded p-1.5 text-xs text-text-primary outline-none focus:border-accent"
                                    >
                                        <option value="Excellent">Excellent (Confirmed Selection)</option>
                                        <option value="Aggressive">Aggressive (Dominating)</option>
                                        <option value="Neutral">Neutral (Moderate)</option>
                                        <option value="Silent">Silent (Lesser Contribution)</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 bg-accent text-base-900 font-bold text-lg rounded-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,184,148,0.4)] flex items-center justify-center gap-2 mt-4 active:scale-95"
                    >
                        Start GD Session
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GDSetup;
