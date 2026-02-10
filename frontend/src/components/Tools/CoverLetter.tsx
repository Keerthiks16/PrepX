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
                name: user?.name,
                role: user?.currentRole,
                skills: user?.skills?.join(", "),
                resumeContext: user?.resumeContext,
                projects: user?.projects
            };

            const { data } = await axios.post('http://localhost:5000/api/chat/cover-letter', {
                userContext,
                jobDescription,
                company,
                manager,
                tone
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
        <div className="max-w-6xl mx-auto p-6 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-red-500 text-transparent bg-clip-text">
                AI Cover Letter Writer
            </h1>
            <p className="text-gray-400 mb-8">Craft compelling, personalized cover letters in seconds.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl space-y-4 h-fit">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                            <input 
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g. OpenAI"
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:border-yellow-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Hiring Manager (Optional)</label>
                            <input 
                                value={manager}
                                onChange={(e) => setManager(e.target.value)}
                                placeholder="e.g. Sam Altman"
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:border-yellow-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Tone</label>
                        <div className="flex space-x-2">
                            {['Professional', 'Enthusiastic', 'Confident'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t as any)}
                                    className={`flex-1 py-2 text-xs font-semibold rounded transition-colors ${
                                        tone === t 
                                            ? 'bg-yellow-600 text-white' 
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Job Description</label>
                        <textarea 
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the JD here..."
                            rows={10}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white resize-none outline-none focus:border-yellow-500"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !jobDescription}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white font-bold rounded-lg transition-transform transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
                    >
                        {loading ? "Writing..." : "Generate Cover Letter ✍️"}
                    </button>
                </div>

                {/* Output */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl flex flex-col h-[600px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-200">Your Letter</h2>
                        {generatedLetter && (
                            <button 
                                onClick={copyToClipboard}
                                className="text-sm text-yellow-400 hover:text-yellow-300 font-semibold"
                            >
                                Copy Text
                            </button>
                        )}
                    </div>
                    <textarea 
                        value={generatedLetter}
                        onChange={(e) => setGeneratedLetter(e.target.value)}
                        className="flex-1 w-full bg-gray-900 rounded-lg p-4 border border-gray-600 text-gray-200 resize-none outline-none leading-relaxed whitespace-pre-wrap"
                        placeholder="Your cover letter will appear here..."
                    />
                </div>
            </div>
        </div>
    );
};

export default CoverLetter;
