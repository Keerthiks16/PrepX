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
                name: user?.name,
                email: user?.email,
                linkedin: user?.linkedin,
                github: user?.github,
                portfolio: user?.portfolio,
                role: user?.currentRole,
                skills: user?.skills?.join(", "),
                resumeContext: user?.resumeContext,
                projects: user?.projects,
                experience: user?.resumeContext // Using resume text as generic experience for now
            };

            const { data } = await axios.post('http://localhost:5000/api/chat/resume-latex', {
                userContext,
                jobDescription,
                mode,
                resumeContent: resumeText,
                targetRole
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
        <div className="max-w-6xl mx-auto p-6 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-orange-400 text-transparent bg-clip-text">
                AI Resume Architect
            </h1>
            <p className="text-gray-400 mb-8">Generate ATS-optimized LaTeX resumes tailored to specific job descriptions.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl space-y-6 h-fit overflow-y-auto max-h-[800px]">
                    
                    {/* Target Role Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Target Role</label>
                        <div className="relative">
                            <input 
                                list="roles"
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Full Stack Developer"
                                className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                            />
                            <datalist id="roles">
                                <option value="Software Engineer" />
                                <option value="Frontend Developer" />
                                <option value="Backend Developer" />
                                <option value="Full Stack Developer" />
                                <option value="Data Scientist" />
                                <option value="Product Manager" />
                                <option value="DevOps Engineer" />
                            </datalist>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Tailors the resume focus to this role.</p>
                    </div>

                    {/* Resume Content Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Current Resume Content</label>
                        <textarea 
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your current resume content here..."
                            rows={8}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white text-xs resize-y focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">AI will maintain this length & substance.</p>
                    </div>

                    <div className="border-t border-gray-700"></div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Strategy Mode</label>
                        <div className="space-y-3">
                            <button
                                onClick={() => setMode('Restructure')}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    mode === 'Restructure' ? 'bg-blue-600/20 border-blue-500 text-blue-200' : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                                <div className="font-bold">Restructure</div>
                                <div className="text-xs opacity-70">Optimize layout & keywords. 100% Truthful.</div>
                            </button>
                            
                            <button
                                onClick={() => setMode('Blend')}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    mode === 'Blend' ? 'bg-purple-600/20 border-purple-500 text-purple-200' : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                                <div className="font-bold">Blend</div>
                                <div className="text-xs opacity-70">Add 1 targeted "suggested" project to bridge gaps.</div>
                            </button>

                            <button
                                onClick={() => setMode('Aggressive')}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    mode === 'Aggressive' ? 'bg-red-600/20 border-red-500 text-red-200' : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                                <div className="font-bold">Aggressive Match</div>
                                <div className="text-xs opacity-70">Heavily tailored. "Fake it til you make it" style.</div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Target Job Description</label>
                        <textarea 
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full JD here..."
                            rows={10}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white text-sm resize-none focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !jobDescription}
                        className="w-full py-3 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white font-bold rounded-lg transition-transform transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Constructing Resume..." : "Generate LaTeX Code ⚡"}
                    </button>
                </div>

                {/* Output */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl flex flex-col h-[800px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-200">Generated LaTeX Source</h2>
                        {generatedLatex && (
                            <button 
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-500 transition-colors text-sm font-bold"
                            >
                                Copy for Overleaf
                            </button>
                        )}
                    </div>
                    
                    <textarea 
                        readOnly
                        value={generatedLatex}
                        className="flex-1 w-full bg-gray-900 rounded-lg p-4 border border-gray-600 font-mono text-xs text-green-400 resize-none outline-none"
                        placeholder="LaTeX code will appear here..."
                    />
                    
                    <div className="mt-4 text-xs text-gray-500 text-center">
                        Tip: Create a new project on Overleaf.com and paste this code into main.tex
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
