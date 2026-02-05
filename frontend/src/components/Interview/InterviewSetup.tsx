import { useState, useEffect } from 'react';

export type InterviewConfig = {
  role: string;
  skills: string;
  jobDescription: string;
  resumeText: string;
  selectedVoiceURI: string;
  selectedAvatar: string;
};

interface InterviewSetupProps {
  onStart: (config: InterviewConfig) => void;
}

const ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "QA Engineer",
  "Product Manager",
  "Software Architect"
];

const InterviewSetup = ({ onStart }: InterviewSetupProps) => {
  const [role, setRole] = useState(ROLES[0]);
  const [skills, setSkills] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");

  useEffect(() => {
    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0) {
            // Default to Google US or first avail
            const defaultVoice = voices.find(v => v.name.includes("Google US English")) || voices[0];
            setSelectedVoiceURI(defaultVoice.voiceURI);
        }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
        window.speechSynthesis.onvoiceschanged = null;
    }
  }, []);

  // Load avatars
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState("");

  useEffect(() => {
    const loadAssets = async () => {
        // Load images from assets folder
        const modules = import.meta.glob('../../assets/interviewer images/*.{jpg,png,jpeg}', { eager: true });
        const loadedAvatars = Object.values(modules).map((mod: any) => mod.default);
        setAvatars(loadedAvatars);
        if (loadedAvatars.length > 0) setSelectedAvatar(loadedAvatars[0]);
    };
    loadAssets();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ role, skills, jobDescription, resumeText, selectedVoiceURI, selectedAvatar });
  };

  return (
    <div className="w-screen flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-xl w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700 my-8">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Interview Setup
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection - NEW */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Interviewer</label>
            <div className="grid grid-cols-4 gap-4">
                {avatars.map((src, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(src)}
                        className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all ${
                            selectedAvatar === src ? 'border-blue-500 scale-110 shadow-blue-500/50 shadow-lg' : 'border-gray-600 hover:border-gray-400 opacity-70 hover:opacity-100'
                        }`}
                    >
                        <img src={src} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Role</label>
            <div className="space-y-3">
              <select 
                value={ROLES.includes(role) ? role : "Other"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "Other") {
                    setRole(""); 
                  } else {
                    setRole(val);
                  }
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                <option value="Other">Other (Type manually)</option>
              </select>

              {(!ROLES.includes(role) || role === "") && (
                <input 
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Type your specific role (e.g. iOS Developer)"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none animate-fade-in"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Skills Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack / Skills (Optional)</label>
            <input 
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, AWS, Kubernetes"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
            />
          </div>

          {/* Resume Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Resume / Experience (Optional)</label>
            <textarea 
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text or a brief summary of your experience here..."
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none resize-none"
            />
          </div>

          {/* Job Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Description (Optional)</label>
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none resize-none"
            />
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Interviewer Voice</label>
            <select 
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
            >
              {availableVoices.map(v => (
                 <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                 </option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Start Interview
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterviewSetup;
