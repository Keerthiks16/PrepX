import { useState, useEffect } from 'react';
import { Briefcase, FileText, Users, Code, Cpu, ChevronDown, ChevronUp } from 'lucide-react';

export type InterviewConfig = {
  role: string;
  skills: string;
  jobDescription: string;
  resumeText: string;
  selectedVoiceURI: string;
  selectedAvatar: string;
  interviewType: 'Classical' | 'Resume' | 'Scenario' | 'Project' | 'Coaching';
  projectContext?: string;
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
  const [interviewType, setInterviewType] = useState<'Classical' | 'Resume' | 'Scenario' | 'Project'>('Classical');
  const [projectContext, setProjectContext] = useState("");
  const [showAvatars, setShowAvatars] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0) {
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

  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState("");

  useEffect(() => {
    const loadAssets = async () => {
        const modules = import.meta.glob('../../assets/interviewer images/*.{jpg,png,jpeg}', { eager: true });
        const loadedAvatars = Object.values(modules).map((mod: any) => mod.default);
        setAvatars(loadedAvatars);
        if (loadedAvatars.length > 0) setSelectedAvatar(loadedAvatars[0]);
    };
    loadAssets();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ role, skills, jobDescription, resumeText, selectedVoiceURI, selectedAvatar, interviewType, projectContext });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-base-900 text-text-primary p-4">
      <div className="max-w-4xl w-full bg-base-800 rounded-2xl shadow-xl p-8 border border-base-600 my-8">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text">
          Interview Setup
        </h1>

        {/* Interview Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { id: 'Classical', label: 'Classical', icon: Briefcase, desc: 'Standard Q&A' },
                { id: 'Resume', label: 'Resume', icon: FileText, desc: 'Deep dive into exp' },
                { id: 'Scenario', label: 'Scenario', icon: Users, desc: 'Situational tests' },
                { id: 'Project', label: 'Project', icon: Code, desc: 'Technical Viva' },
            ].map((type) => (
                <button
                    key={type.id}
                    onClick={() => setInterviewType(type.id as any)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                        interviewType === type.id
                            ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(0,184,148,0.3)] scale-105' 
                            : 'bg-base-900 border-base-600/30 hover:border-accent/50 hover:bg-base-900/80 opacity-70 hover:opacity-100'
                    }`}
                >
                    <type.icon className={`w-8 h-8 mb-2 ${interviewType === type.id ? 'text-accent-200' : 'text-text-secondary'}`} />
                    <span className={`font-bold ${interviewType === type.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {type.label}
                    </span>
                    <span className="text-[10px] text-text-secondary/60 mt-1 uppercase tracking-wider">{type.desc}</span>
                </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          {/* Avatar Selection */}
          <div className="bg-base-900/50 p-4 rounded-xl border border-base-600/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent">
                        <img src={selectedAvatar} alt="Selected Interviewer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-primary">Current Interviewer</label>
                        <p className="text-xs text-text-secondary">Ready to start your session</p>
                    </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAvatars(!showAvatars)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-base-700 hover:bg-base-600 transition-colors text-sm font-semibold"
                >
                  {showAvatars ? 'Close Selection' : 'Change Interviewer'}
                  {showAvatars ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {showAvatars && (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 pt-4 border-t border-base-600/30 animate-fade-in">
                    {avatars.map((src, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => { setSelectedAvatar(src); setShowAvatars(false); }}
                            className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all ${
                                selectedAvatar === src ? 'border-accent scale-110 shadow-accent/50 shadow-lg' : 'border-base-600 hover:border-accent opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img src={src} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Target Role</label>
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
                className="w-full px-4 py-2 bg-base-900 border border-base-600 rounded-lg focus:ring-2 focus:ring-accent text-text-primary outline-none transition-all"
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
                  className="w-full px-4 py-2 bg-base-900 border border-base-600 rounded-lg focus:ring-2 focus:ring-accent text-text-primary outline-none animate-fade-in transition-all"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Project Context */}
          {interviewType === 'Project' && (
            <div className="animate-fade-in">
                <label className="block text-sm font-medium text-text-secondary mb-2">Project Description / README</label>
                <textarea 
                  value={projectContext}
                  onChange={(e) => setProjectContext(e.target.value)}
                  placeholder="Paste your project's README or detailed description here..."
                  rows={6}
                  className="w-full px-4 py-2 bg-base-900 border border-base-600 rounded-lg focus:ring-2 focus:ring-accent text-text-primary outline-none resize-none transition-all"
                  required
                />
            </div>
          )}

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Tech Stack / Skills (Optional)</label>
            <input 
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, AWS, Kubernetes"
              className="w-full px-4 py-2 bg-base-900 border border-base-600 rounded-lg focus:ring-2 focus:ring-accent text-text-primary outline-none transition-all"
            />
          </div>

          {/* Resume */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Resume / Experience (Optional)</label>
            <textarea 
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text or a brief summary of your experience here..."
              rows={4}
              className="w-full px-4 py-2 bg-base-900 border border-base-600 rounded-lg focus:ring-2 focus:ring-accent text-text-primary outline-none resize-none transition-all"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Job Description (Optional)</label>
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here..."
              rows={3}
              className="w-full px-4 py-2 bg-base-900 border border-base-600 rounded-lg focus:ring-2 focus:ring-accent text-text-primary outline-none resize-none transition-all"
            />
          </div>

          {/* Voice */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Interviewer Voice</label>
            <select 
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="w-full px-4 py-2 bg-base-900 border border-base-600 rounded-lg focus:ring-2 focus:ring-accent text-text-primary outline-none transition-all"
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
            className="w-full py-4 px-6 bg-gradient-to-r from-accent-600 to-accent text-white font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,184,148,0.4)] border border-accent-200/20 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
                Start Interview
                <Cpu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterviewSetup;
