import { useState, useEffect } from 'react';
import axios from 'axios';

interface Job {
    _id: string;
    company: string;
    role: string;
    status: 'Applied' | 'Interview' | 'Task' | 'Offer' | 'Rejected';
    dateApplied: string;
    notes?: string;
}

const STATUS_COLS = ['Applied', 'Task', 'Interview', 'Offer', 'Rejected'];

const JobBoard = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Form State
    const [newCompany, setNewCompany] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newStatus, setNewStatus] = useState("Applied");

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/jobs', { withCredentials: true });
            setJobs(data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddJob = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:5000/api/jobs', {
                company: newCompany,
                role: newRole,
                status: newStatus
            }, { withCredentials: true });
            
            setJobs([data, ...jobs]);
            setShowAddModal(false);
            setNewCompany("");
            setNewRole("");
        } catch (error) {
            console.error("Failed to add job", error);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        // Optimistic UI update
        const updatedJobs = jobs.map(j => j._id === id ? { ...j, status: newStatus as any } : j);
        setJobs(updatedJobs);

        try {
            await axios.put(`http://localhost:5000/api/jobs/${id}`, { status: newStatus }, { withCredentials: true });
        } catch (error) {
            console.error("Update failed", error);
            fetchJobs(); // Revert on failure
        }
    };

    const deleteJob = async (id: string) => {
        if(!confirm("Are you sure you want to delete this job?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/jobs/${id}`, { withCredentials: true });
            setJobs(jobs.filter(j => j._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    if (loading) return <div className="text-white p-8">Loading Board...</div>;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    Job Application Tracker
                </h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/30"
                >
                    + Add New Job
                </button>
            </div>

            {/* Board Grid */}
            <div className="flex gap-4 overflow-x-auto pb-4">
                {STATUS_COLS.map(status => (
                    <div key={status} className="min-w-[280px] flex-1 bg-gray-800/50 rounded-xl border border-gray-700 p-4 flex flex-col">
                        <h3 className={`text-lg font-bold mb-4 px-2 py-1 rounded w-fit ${
                            status === 'Offer' ? 'bg-green-500/20 text-green-300' :
                            status === 'Rejected' ? 'bg-red-500/20 text-red-300' :
                            'bg-gray-700 text-gray-200'
                        }`}>
                            {status} <span className="text-sm opacity-60 ml-2">{jobs.filter(j => j.status === status).length}</span>
                        </h3>
                        
                        <div className="space-y-3 flex-1">
                            {jobs.filter(j => j.status === status).map(job => (
                                <div key={job._id} className="bg-gray-800 p-4 rounded-lg border border-gray-600 shadow-sm hover:border-blue-500/50 transition-all group relative">
                                    <h4 className="font-bold text-white">{job.company}</h4>
                                    <p className="text-sm text-gray-400 mb-2">{job.role}</p>
                                    <div className="text-xs text-gray-500 mb-2">{new Date(job.dateApplied).toLocaleDateString()}</div>
                                    
                                    {/* Quick Actions (Hover) */}
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                                        <select 
                                            value={job.status}
                                            onChange={(e) => updateStatus(job._id, e.target.value)}
                                            className="bg-gray-900 border border-gray-600 text-xs rounded px-2 py-1 text-gray-300 outline-none focus:border-blue-500"
                                        >
                                            {STATUS_COLS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button 
                                            onClick={() => deleteJob(job._id)}
                                            className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Job Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 w-full max-w-md p-6 rounded-2xl border border-gray-700 shadow-2xl animate-fade-in">
                        <h2 className="text-xl font-bold text-white mb-4">Add Application</h2>
                        <form onSubmit={handleAddJob} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Company</label>
                                <input 
                                    value={newCompany}
                                    onChange={e => setNewCompany(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Role</label>
                                <input 
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Initial Status</label>
                                <select 
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none"
                                >
                                    {STATUS_COLS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                                >
                                    Add Job
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobBoard;
