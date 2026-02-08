import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore, type User } from '../../store/authStore';

const Profile = () => {
    const { user, login } = useAuthStore();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [msg, setMsg] = useState("");

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                skills: user.skills || [],
                resumeContext: user.resumeContext || "",
                experienceLevel: user.experienceLevel || "Entry",
                projects: user.projects || []
            });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            const { data } = await axios.put('http://localhost:5000/api/auth/profile', formData, {
                withCredentials: true
            });
            login(data); // Update store
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

    if (!user) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-gray-900 min-h-screen text-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    My Profile
                </h1>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${
                        isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
            </div>

            {msg && <div className="mb-4 p-3 bg-green-500/20 text-green-300 rounded border border-green-500/50">{msg}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-300">Basic Info</h2>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Name</label>
                        <input
                            disabled={!isEditing}
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            disabled
                            value={user.email}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-gray-400 disabled:opacity-50 cursor-not-allowed"
                        />
                    </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Experience Level</label>
                        <select
                            disabled={!isEditing}
                            value={formData.experienceLevel || "Entry"}
                            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white disabled:opacity-50"
                        >
                            <option value="Entry">Entry Level</option>
                            <option value="Mid">Mid Level</option>
                            <option value="Senior">Senior Level</option>
                        </select>
                    </div>
                </div>

                {/* Skills & Resume */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-300">Skills & Resume</h2>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Skills</label>
                        
                        {/* Tags Display */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.skills?.map((skill, index) => (
                                <span key={index} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-500/30">
                                    {skill}
                                    {isEditing && (
                                        <button 
                                            onClick={() => {
                                                const newSkills = [...(formData.skills || [])];
                                                newSkills.splice(index, 1);
                                                setFormData({ ...formData, skills: newSkills });
                                            }}
                                            className="text-blue-400 hover:text-white font-bold"
                                        >
                                            ×
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>

                        {/* Add Skill Input */}
                        {isEditing && (
                            <div className="flex gap-2">
                                <input
                                    id="skill-input"
                                    placeholder="Add a skill (e.g. React)"
                                    className="flex-1 bg-gray-700 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('skill-input') as HTMLInputElement;
                                        const val = input.value.trim();
                                        if (val && !formData.skills?.includes(val)) {
                                            setFormData({ ...formData, skills: [...(formData.skills || []), val] });
                                            input.value = "";
                                        }
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-bold transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm text-gray-400">Resume Summary / Context</label>
                            {isEditing && (
                                <button 
                                    onClick={() => setShowResumeModal(true)}
                                    className="text-xs text-blue-400 hover:text-white flex items-center gap-1"
                                >
                                    ✨ Generate from Resume
                                </button>
                            )}
                        </div>
                        <textarea
                            disabled={!isEditing}
                            value={formData.resumeContext || ""}
                            onChange={(e) => setFormData({ ...formData, resumeContext: e.target.value })}
                            rows={4}
                            placeholder="Paste your resume summary here for the AI..."
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white disabled:opacity-50 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Resume Generator Modal */}
            {showResumeModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full border border-gray-700 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 text-white">Generate Profile Summary</h2>
                        <p className="text-gray-400 text-sm mb-4">Paste your full resume below. AI will extract key details to create a professional summary.</p>
                        
                        <textarea
                            value={rawResume}
                            onChange={(e) => setRawResume(e.target.value)}
                            className="w-full h-48 bg-gray-900 border border-gray-600 rounded p-3 text-sm text-gray-300 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Paste resume text here..."
                        />
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowResumeModal(false)}
                                className="px-4 py-2 text-gray-300 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateSummary}
                                disabled={generating || !rawResume}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold disabled:opacity-50 flex items-center gap-2"
                            >
                                {generating ? "Generating..." : "Generate Summary"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Projects Section */}
            <div className="mt-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-semibold text-gray-300">Projects</h2>
                     {isEditing && (
                         <button onClick={addProject} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors">
                             + Add Project
                         </button>
                     )}
                </div>

                <div className="space-y-6">
                    {formData.projects?.map((proj, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <input
                                    disabled={!isEditing}
                                    value={proj.title}
                                    onChange={(e) => updateProject(idx, 'title', e.target.value)}
                                    placeholder="Project Title"
                                    className="bg-gray-700 border border-gray-600 rounded p-2 text-white font-bold disabled:opacity-50"
                                />
                                <div className="flex gap-2">
                                     <input
                                        disabled={!isEditing}
                                        value={proj.githubLink || ""}
                                        onChange={(e) => updateProject(idx, 'githubLink', e.target.value)}
                                        placeholder="GitHub Link"
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded p-2 text-sm text-blue-400 disabled:opacity-50"
                                    />
                                    <input
                                        disabled={!isEditing}
                                        value={proj.deploymentLink || ""}
                                        onChange={(e) => updateProject(idx, 'deploymentLink', e.target.value)}
                                        placeholder="Live Link"
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded p-2 text-sm text-green-400 disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            
                            <textarea
                                disabled={!isEditing}
                                value={proj.description || ""}
                                onChange={(e) => updateProject(idx, 'description', e.target.value)}
                                placeholder="Brief Description..."
                                rows={2}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm text-gray-300 mb-2 disabled:opacity-50 resize-none"
                            />
                             <textarea
                                disabled={!isEditing}
                                value={proj.workflow || ""}
                                onChange={(e) => updateProject(idx, 'workflow', e.target.value)}
                                placeholder="Explain the workflow/architecture..."
                                rows={2}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm text-gray-400 disabled:opacity-50 resize-none italic"
                            />
                            
                            {isEditing && (
                                <button onClick={() => removeProject(idx)} className="mt-2 text-red-400 text-xs hover:underline">
                                    Remove Project
                                </button>
                            )}
                        </div>
                    ))}
                    {formData.projects?.length === 0 && <p className="text-gray-500 text-center italic">No projects added yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default Profile;
