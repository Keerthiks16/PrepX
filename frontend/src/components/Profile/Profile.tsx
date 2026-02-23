import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore, type User } from '../../store/authStore';
import Loader from '../Common/Loader';

const Profile = () => {
    const { user, login } = useAuthStore();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name, email: user.email,
                skills: user.skills || [], resumeContext: user.resumeContext || "",
                experienceLevel: user.experienceLevel || "Entry",
                projects: user.projects || []
            });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            const { data } = await axios.put('http://localhost:5000/api/auth/profile', formData, { withCredentials: true });
            login(data);
            setMsg("Profile Updated!");
            setIsEditing(false);
            setTimeout(() => setMsg(""), 3000);
        } catch (error) {
            console.error("Update failed", error);
            setMsg("Failed to update profile.");
        }
    };

    const addProject = () => {
        const newProject = { title: "New Project", description: "", workflow: "", githubLink: "", deploymentLink: "" };
        setFormData({ ...formData, projects: [...(formData.projects || []), newProject] });
    };

    const updateProject = (index: number, field: string, value: string) => {
        const updatedProjects = [...(formData.projects || [])];
        updatedProjects[index] = { ...updatedProjects[index], [field]: value };
        setFormData({ ...formData, projects: updatedProjects });
    };

    const [showResumeModal, setShowResumeModal] = useState(false);
    const [rawResume, setRawResume] = useState("");
    const [generating, setGenerating] = useState(false);

    const removeProject = (index: number) => {
        const updatedProjects = [...(formData.projects || [])];
        updatedProjects.splice(index, 1);
        setFormData({ ...formData, projects: updatedProjects });
    };

    const handleGenerateSummary = async () => {
        setGenerating(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/chat/resume-summary', { resumeText: rawResume });
            setFormData({ ...formData, resumeContext: data.summary });
            setShowResumeModal(false);
            setRawResume("");
        } catch (error) {
            console.error(error);
            alert("Failed to generate summary");
        } finally {
            setGenerating(false);
        }
    };

    if (!user) return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <Loader />
      </div>
    );

    return (
        <div className="w-full h-full p-6 md:p-8 bg-base-900 min-h-screen text-text-primary">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text">
                    My Profile
                </h1>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`px-6 py-2 rounded-lg font-bold transition-all shadow-md ${
                        isEditing 
                        ? 'bg-gradient-to-r from-accent-600 to-accent hover:opacity-90 text-white' 
                        : 'bg-base-800 hover:bg-base-700 text-text-secondary border border-base-600'
                    }`}
                >
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
            </div>

            {msg && <div className="mb-4 p-3 bg-accent/20 text-accent-200 rounded border border-accent/50">{msg}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="bg-base-800/80 backdrop-blur-sm p-6 rounded-xl border border-base-600/30 shadow-lg space-y-4 hover:border-accent/30 transition-all">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">Basic Info</h2>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Name</label>
                        <input disabled={!isEditing} value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary disabled:opacity-50 focus:ring-2 focus:ring-accent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Email</label>
                        <input disabled value={user.email}
                            className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-secondary disabled:opacity-50 cursor-not-allowed"
                        />
                    </div>
                     <div>
                        <label className="block text-sm text-text-secondary mb-1">Experience Level</label>
                        <select disabled={!isEditing} value={formData.experienceLevel || "Entry"}
                            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                            className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary disabled:opacity-50 focus:ring-2 focus:ring-accent outline-none transition-all"
                        >
                            <option value="Entry">Entry Level</option>
                            <option value="Mid">Mid Level</option>
                            <option value="Senior">Senior Level</option>
                        </select>
                    </div>
                </div>

                {/* Skills & Resume */}
                <div className="bg-base-800/80 backdrop-blur-sm p-6 rounded-xl border border-base-600/30 shadow-lg space-y-4 hover:border-accent/30 transition-all">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">Skills & Resume</h2>
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Skills</label>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.skills?.map((skill, index) => (
                                <span key={index} className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 border shadow-sm ${
                                    index % 3 === 0 ? 'bg-accent/10 text-accent-200 border-accent/30' :
                                    index % 3 === 1 ? 'bg-accent-700/20 text-accent-300 border-accent-700/30' :
                                    'bg-accent-800/20 text-accent-100 border-accent-800/30'
                                }`}>
                                    {skill}
                                    {isEditing && (
                                        <button onClick={() => {
                                                const newSkills = [...(formData.skills || [])];
                                                newSkills.splice(index, 1);
                                                setFormData({ ...formData, skills: newSkills });
                                            }}
                                            className="text-text-secondary hover:text-text-primary font-bold"
                                        >×</button>
                                    )}
                                </span>
                            ))}
                        </div>

                        {isEditing && (
                            <div className="flex gap-2">
                                <input id="skill-input" placeholder="Add a skill (e.g. React)"
                                    className="flex-1 bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val && !formData.skills?.includes(val)) {
                                                setFormData({ ...formData, skills: [...(formData.skills || []), val] });
                                                e.currentTarget.value = "";
                                            }
                                        }
                                    }}
                                />
                                <button onClick={() => {
                                        const input = document.getElementById('skill-input') as HTMLInputElement;
                                        const val = input.value.trim();
                                        if (val && !formData.skills?.includes(val)) {
                                            setFormData({ ...formData, skills: [...(formData.skills || []), val] });
                                            input.value = "";
                                        }
                                    }}
                                    className="bg-accent hover:bg-accent-300 px-4 py-2 rounded-lg text-base-900 font-bold transition-colors"
                                >Add</button>
                            </div>
                        )}
                    </div>
                    {/* Contact Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-text-secondary mb-1 text-sm">LinkedIn URL</label>
                            <input disabled={!isEditing} value={formData.linkedin || ''}
                                onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                                className="w-full p-2 rounded-lg bg-base-900 text-text-primary border border-base-600 focus:border-accent outline-none disabled:opacity-50 transition-all"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div>
                            <label className="block text-text-secondary mb-1 text-sm">GitHub URL</label>
                            <input disabled={!isEditing} value={formData.github || ''}
                                onChange={(e) => setFormData({...formData, github: e.target.value})}
                                className="w-full p-2 rounded-lg bg-base-900 text-text-primary border border-base-600 focus:border-accent outline-none disabled:opacity-50 transition-all"
                                placeholder="https://github.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-text-secondary mb-1 text-sm">Portfolio URL</label>
                            <input disabled={!isEditing} value={formData.portfolio || ''}
                                onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                                className="w-full p-2 rounded-lg bg-base-900 text-text-primary border border-base-600 focus:border-accent outline-none disabled:opacity-50 transition-all"
                                placeholder="https://myportfolio.com"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm text-text-secondary">Resume Summary / Context</label>
                            {isEditing && (
                                <button onClick={() => setShowResumeModal(true)}
                                    className="text-xs text-accent-200 hover:text-accent flex items-center gap-1 font-bold transition-colors"
                                >✨ Generate from Resume</button>
                            )}
                        </div>
                        <textarea disabled={!isEditing} value={formData.resumeContext || ""}
                            onChange={(e) => setFormData({ ...formData, resumeContext: e.target.value })}
                            rows={4} placeholder="Paste your resume summary here for the AI..."
                            className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary disabled:opacity-50 resize-none focus:ring-2 focus:ring-accent outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Resume Modal */}
            {showResumeModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-base-800 p-6 rounded-xl max-w-2xl w-full border border-base-600 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 text-text-primary">Generate Profile Summary</h2>
                        <p className="text-text-secondary text-sm mb-4">Paste your full resume below. AI will extract key details to create a professional summary.</p>
                        <textarea value={rawResume} onChange={(e) => setRawResume(e.target.value)}
                            className="w-full h-48 bg-base-900 border border-base-600 rounded-lg p-3 text-sm text-text-primary mb-4 focus:ring-2 focus:ring-accent outline-none transition-all"
                            placeholder="Paste resume text here..."
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowResumeModal(false)}
                                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                            >Cancel</button>
                            <button onClick={handleGenerateSummary} disabled={generating || !rawResume}
                                className="px-6 py-2 bg-accent hover:bg-accent-300 text-base-900 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2 transition-colors"
                            >{generating ? "Generating..." : "Generate Summary"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Projects */}
            <div className="mt-8 bg-base-800/80 backdrop-blur-sm p-6 rounded-xl border border-base-600/30 shadow-lg hover:border-accent/30 transition-all">
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-semibold text-text-primary">Projects</h2>
                     {isEditing && (
                         <button onClick={addProject} className="text-sm bg-accent/20 hover:bg-accent text-accent-200 hover:text-base-900 px-3 py-1 rounded-lg transition-colors font-bold border border-accent/30">
                             + Add Project
                         </button>
                     )}
                </div>

                <div className="space-y-6">
                    {formData.projects?.map((proj, idx) => (
                        <div key={idx} className="bg-base-900 p-4 rounded-lg border border-base-600/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <input disabled={!isEditing} value={proj.title}
                                    onChange={(e) => updateProject(idx, 'title', e.target.value)}
                                    placeholder="Project Title"
                                    className="bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary font-bold disabled:opacity-50 focus:ring-2 focus:ring-accent outline-none transition-all"
                                />
                                <div className="flex gap-2">
                                     <input disabled={!isEditing} value={proj.githubLink || ""}
                                        onChange={(e) => updateProject(idx, 'githubLink', e.target.value)}
                                        placeholder="GitHub Link"
                                        className="flex-1 bg-base-900 border border-base-600 rounded-lg p-2 text-sm text-accent-300 disabled:opacity-50 focus:ring-2 focus:ring-accent outline-none transition-all"
                                    />
                                    <input disabled={!isEditing} value={proj.deploymentLink || ""}
                                        onChange={(e) => updateProject(idx, 'deploymentLink', e.target.value)}
                                        placeholder="Live Link"
                                        className="flex-1 bg-base-900 border border-base-600 rounded-lg p-2 text-sm text-accent-200 disabled:opacity-50 focus:ring-2 focus:ring-accent outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <textarea disabled={!isEditing} value={proj.description || ""}
                                onChange={(e) => updateProject(idx, 'description', e.target.value)}
                                placeholder="Brief Description..." rows={2}
                                className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-sm text-text-primary mb-2 disabled:opacity-50 resize-none focus:ring-2 focus:ring-accent outline-none transition-all"
                            />
                             <textarea disabled={!isEditing} value={proj.workflow || ""}
                                onChange={(e) => updateProject(idx, 'workflow', e.target.value)}
                                placeholder="Explain the workflow/architecture..." rows={2}
                                className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-sm text-text-secondary disabled:opacity-50 resize-none italic focus:ring-2 focus:ring-accent outline-none transition-all"
                            />
                            {isEditing && (
                                <button onClick={() => removeProject(idx)} className="mt-2 text-error text-xs hover:text-error/80 hover:underline">
                                    Remove Project
                                </button>
                            )}
                        </div>
                    ))}
                    {formData.projects?.length === 0 && <p className="text-text-secondary/50 text-center italic">No projects added yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default Profile;
