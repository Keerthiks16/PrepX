import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

const CoverLetter = () => {
    const { user } = useAuthStore();
    const [jobDescription, setJobDescription] = useState('');
    const [company, setCompany] = useState('');
    const [manager, setManager] = useState('');
    const [tone, setTone] = useState<'Professional' | 'Enthusiastic' | 'Confident'>('Professional');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const userContext = {
                name: user?.name, role: user?.currentRole,
                skills: user?.skills?.join(", "), resumeContext: user?.resumeContext,
                projects: user?.projects
            };
            const { data } = await axios.post('http://localhost:5000/api/chat/cover-letter', {
                userContext, jobDescription, company, manager, tone
            });
            setGeneratedLetter(data.coverLetter);
        } catch (error) {
            console.error(error);
            alert("Failed to generate cover letter");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLetter);
        alert("Copied to clipboard!");
    };

    return (
        <div className="max-w-6xl mx-auto p-6 text-text-primary min-h-screen">
            <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text">
                AI Cover Letter Writer
            </h1>
            <p className="text-text-secondary mb-8">Craft compelling, personalized cover letters in seconds.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="bg-base-800/80 backdrop-blur-md p-6 rounded-2xl border border-base-600/30 shadow-xl space-y-4 h-fit">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Company Name</label>
                            <input value={company} onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g. OpenAI"
                                className="w-full bg-base-900/50 border border-base-600/50 rounded-xl p-3 text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Hiring Manager (Optional)</label>
                            <input value={manager} onChange={(e) => setManager(e.target.value)}
                                className="w-full bg-base-900/50 border border-base-600/50 rounded-xl p-3 text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Tone</label>
                        <div className="flex space-x-2">
                            {['Professional', 'Enthusiastic', 'Confident'].map((t) => (
                                <button key={t} onClick={() => setTone(t as any)}
                                    className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${
                                        tone === t 
                                            ? 'bg-accent text-base-900 shadow-lg scale-105' 
                                            : 'bg-base-900/40 text-text-secondary hover:bg-base-900 hover:text-text-primary'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Job Description</label>
                        <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the JD here..." rows={10}
                            className="w-full bg-base-900/50 border border-base-600/50 rounded-xl p-3 text-text-primary resize-none outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
                        />
                    </div>

                    <button onClick={handleGenerate} disabled={loading || !jobDescription}
                        className="w-full py-4 bg-gradient-to-r from-accent-600 to-accent hover:opacity-90 text-white border border-accent-200/30 font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(0,184,148,0.3)] disabled:opacity-50"
                    >
                        {loading ? "Writing..." : "Generate Cover Letter ✍️"}
                    </button>
                </div>

                {/* Output */}
                <div className="bg-base-800/80 backdrop-blur-md p-6 rounded-2xl border border-base-600/30 shadow-xl flex flex-col h-[600px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-text-primary">Your Letter</h2>
                        {generatedLetter && (
                            <button onClick={copyToClipboard}
                                className="text-sm text-accent-200 hover:text-accent font-semibold transition-colors"
                            >
                                Copy Text
                            </button>
                        )}
                    </div>
                    <textarea value={generatedLetter} onChange={(e) => setGeneratedLetter(e.target.value)}
                        className="flex-1 w-full bg-base-900 rounded-lg p-4 border border-base-600 text-text-primary resize-none outline-none leading-relaxed whitespace-pre-wrap"
                        placeholder="Your cover letter will appear here..."
                    />
                </div>
            </div>
        </div>
    );
};

export default CoverLetter;
