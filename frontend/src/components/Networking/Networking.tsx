import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { NETWORKING_TEMPLATES, type TemplateKey } from './templates';

const Networking = () => {
    const { user } = useAuthStore();
    const [recipient, setRecipient] = useState({ name: '', role: '', company: '' });
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('Connect - fresher');
    const [jobDescription, setJobDescription] = useState('');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const userContext = {
                name: user?.name, skills: user?.skills?.join(", "),
                projects: user?.projects, degree: "B.Tech", 
                college: "Thadomal Shahani Engineering College",
                linkedin: user?.linkedin, portfolio: user?.portfolio, github: user?.github
            };
            const { data } = await axios.post('/api/chat/networking-message', {
                userContext, recipient, templateName: selectedTemplate,
                templateText: NETWORKING_TEMPLATES[selectedTemplate], jobDescription
            });
            setGeneratedMessage(data.message);
        } catch (error) {
            console.error(error);
            alert("Failed to generate message");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedMessage);
        alert("Copied to clipboard!");
    };

    return (
        <div className="w-full h-full p-6 text-text-primary min-h-screen bg-base-900">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text">
                Networking AI Assistant
            </h1>
            <p className="text-text-secondary mb-8">Select a proven template and let AI tailor it to your profile and the specific opportunity.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input */}
                <div className="bg-base-800/80 backdrop-blur-md p-6 rounded-2xl border border-base-600/30 shadow-xl space-y-4">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">Configuration</h2>
                    
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Message Template</label>
                        <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value as TemplateKey)}
                            className="w-full bg-base-900/50 border border-base-600/50 rounded-xl p-3 text-text-primary focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                        >
                            {Object.keys(NETWORKING_TEMPLATES).map((key) => (
                                <option key={key} value={key}>{key}</option>
                            ))}
                        </select>
                        <p className="text-xs text-text-secondary/50 mt-1">Select the strategy that fits your relationship level.</p>
                    </div>

                    <div className="bg-base-900/50 p-3 rounded border border-base-600/50">
                        <label className="block text-xs text-text-secondary/70 mb-1 uppercase tracking-wider">Template Preview</label>
                        <p className="text-sm text-text-primary whitespace-pre-wrap font-mono text-xs opacity-80">
                            {NETWORKING_TEMPLATES[selectedTemplate]}
                        </p>
                    </div>

                    <div className="border-t border-base-600/30 my-4"></div>

                    <h3 className="text-sm font-semibold text-text-secondary">Recipient Details</h3>
                    <div>
                        <label className="block text-sm text-text-secondary/70 mb-1">Name</label>
                        <input value={recipient.name} onChange={(e) => setRecipient({...recipient, name: e.target.value})}
                            placeholder="e.g. Sarah Jenkins"
                            className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-text-secondary/70 mb-1">Role</label>
                            <input value={recipient.role} onChange={(e) => setRecipient({...recipient, role: e.target.value})}
                                placeholder="e.g. Senior Recruiter"
                                className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary/70 mb-1">Company</label>
                            <input value={recipient.company} onChange={(e) => setRecipient({...recipient, company: e.target.value})}
                                placeholder="e.g. Google"
                                className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary/70 mb-1">Job Context / JD (Optional)</label>
                        <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste job title or short description to tailor the message..." rows={3}
                            className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary resize-none focus:ring-2 focus:ring-accent outline-none transition-all"
                        />
                    </div>

                    <button onClick={handleGenerate} disabled={loading || !recipient.name}
                        className="w-full py-4 bg-gradient-to-r from-accent-600 to-accent hover:opacity-90 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(0,184,148,0.39)] border border-accent-200/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Tailoring Message..." : "Generate Optimized Draft 🚀"}
                    </button>
                </div>

                {/* Output */}
                <div className="bg-base-800/80 backdrop-blur-md p-6 rounded-2xl border border-base-600/30 shadow-xl flex flex-col h-full">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">Generated Message</h2>
                    
                    <div className="flex-1 bg-base-900 rounded-lg p-4 border border-base-600 font-mono text-sm text-text-primary overflow-auto whitespace-pre-wrap">
                        {generatedMessage ? generatedMessage : (
                            <div className="h-full flex items-center justify-center text-text-secondary/50 italic">
                                Fill details and click Generate to see the magic happen...
                            </div>
                        )}
                    </div>

                    {generatedMessage && (
                        <div className="mt-4 flex justify-end">
                            <button onClick={copyToClipboard}
                                className="px-4 py-2 bg-base-900 hover:bg-base-700 text-text-secondary rounded border border-base-600 transition-colors flex items-center gap-2 font-medium"
                            >
                                📋 Copy to Clipboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Networking;
