import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

const ResumeBuilder = () => {
    const { user } = useAuthStore();
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState(user?.resumeContext || '');
    const [targetRole, setTargetRole] = useState(user?.currentRole || '');
    const [mode, setMode] = useState<'Restructure' | 'Blend' | 'Aggressive'>('Restructure');
    const [generatedLatex, setGeneratedLatex] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const userContext = {
                name: user?.name, email: user?.email, linkedin: user?.linkedin,
                github: user?.github, portfolio: user?.portfolio, role: user?.currentRole,
                skills: user?.skills?.join(", "), resumeContext: user?.resumeContext,
                projects: user?.projects, experience: user?.resumeContext
            };
            const { data } = await axios.post('http://localhost:5000/api/chat/resume-latex', {
                userContext, jobDescription, mode, resumeContent: resumeText, targetRole
            });
            setGeneratedLatex(data.latexCode);
        } catch (error) {
            console.error(error);
            alert("Failed to generate resume code");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLatex);
        alert("Copied LaTeX code! Paste it into Overleaf.com");
    };

    return (
        <div className="w-full h-full p-6 text-text-primary min-h-screen bg-gradient-to-br from-base-900 via-base-800 to-accent-900/20">
            <h1 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-200">
                AI Resume Architect
            </h1>
            <p className="text-text-secondary mb-8">Generate ATS-optimized LaTeX resumes tailored to specific job descriptions.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-1 bg-base-800/80 backdrop-blur-md p-6 rounded-2xl border border-base-600/30 shadow-xl space-y-6 h-fit overflow-y-auto max-h-[800px]">
                    
                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Target Role</label>
                        <div className="relative">
                            <input 
                                list="roles" type="text" value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Full Stack Developer"
                                className="w-full bg-base-900/50 border border-base-600/50 rounded-xl p-3 text-text-primary text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                            />
                            <datalist id="roles">
                                <option value="Software Engineer" /><option value="Frontend Developer" />
                                <option value="Backend Developer" /><option value="Full Stack Developer" />
                                <option value="Data Scientist" /><option value="Product Manager" />
                                <option value="DevOps Engineer" />
                            </datalist>
                        </div>
                        <p className="text-xs text-text-secondary/50 mt-1">Tailors the resume focus to this role.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Current Resume Content</label>
                        <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your current resume content here..." rows={8}
                            className="w-full bg-base-900/50 border border-base-600/50 rounded-xl p-3 text-text-primary text-xs resize-y focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                        />
                        <p className="text-xs text-text-secondary/50 mt-1">AI will maintain this length & substance.</p>
                    </div>

                    <div className="border-t border-base-600/30"></div>

                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Strategy Mode</label>
                        <div className="space-y-3">
                            <button onClick={() => setMode('Restructure')}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${
                                    mode === 'Restructure' 
                                    ? 'bg-accent-200 text-base-900 border-accent-200 shadow-lg scale-[1.02]' 
                                    : 'bg-base-900/40 border-base-600/30 text-text-secondary hover:bg-base-900 hover:border-accent/30'
                                }`}
                            >
                                <div className="font-bold">Restructure</div>
                                <div className="text-xs opacity-70">Optimize layout & keywords. 100% Truthful.</div>
                            </button>
                            
                            <button onClick={() => setMode('Blend')}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${
                                    mode === 'Blend' 
                                    ? 'bg-accent text-base-900 border-accent shadow-lg scale-[1.02]' 
                                    : 'bg-base-900/40 border-base-600/30 text-text-secondary hover:bg-base-900 hover:border-accent/30'
                                }`}
                            >
                                <div className="font-bold">Blend</div>
                                <div className="text-xs opacity-70">Add 1 targeted "suggested" project to bridge gaps.</div>
                            </button>

                            <button onClick={() => setMode('Aggressive')}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${
                                    mode === 'Aggressive' 
                                    ? 'bg-accent-600 text-white border-accent-600 shadow-lg scale-[1.02]' 
                                    : 'bg-base-900/40 border-base-600/30 text-text-secondary hover:bg-base-900 hover:border-accent-600/30'
                                }`}
                            >
                                <div className="font-bold">Aggressive Match</div>
                                <div className="text-xs opacity-70">Heavily tailored. "Fake it til you make it" style.</div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Target Job Description</label>
                        <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full JD here..." rows={10}
                            className="w-full bg-base-900 border border-base-600 rounded-lg p-3 text-text-primary text-sm resize-none focus:ring-2 focus:ring-accent outline-none transition-all"
                        />
                    </div>

                    <button onClick={handleGenerate} disabled={loading || !jobDescription}
                        className="w-full py-4 bg-gradient-to-r from-accent-600 via-accent to-accent-300 text-base-900 font-extrabold text-lg rounded-xl transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,184,148,0.4)] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white/20"
                    >
                        {loading ? "Constructing Resume..." : "Generate LaTeX Code ⚡"}
                    </button>
                </div>

                {/* Output */}
                <div className="lg:col-span-2 bg-base-800 p-6 rounded-xl border border-base-600 shadow-xl flex flex-col h-[800px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-text-primary">Generated LaTeX Source</h2>
                        {generatedLatex && (
                            <button onClick={copyToClipboard}
                                className="px-4 py-2 bg-base-900 hover:bg-base-700 text-text-secondary rounded border border-base-600 transition-colors text-sm font-bold"
                            >
                                Copy for Overleaf
                            </button>
                        )}
                    </div>
                    <textarea readOnly value={generatedLatex}
                        className="flex-1 w-full bg-base-900 rounded-lg p-4 border border-base-600 font-mono text-xs text-accent-200 resize-none outline-none"
                        placeholder="LaTeX code will appear here..."
                    />
                    <div className="mt-4 text-xs text-text-secondary/50 text-center">
                        Tip: Create a new project on Overleaf.com and paste this code into main.tex
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
