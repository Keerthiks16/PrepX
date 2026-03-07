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
    
    const [newCompany, setNewCompany] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newStatus, setNewStatus] = useState("Applied");

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await axios.get('/api/jobs', { withCredentials: true });
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
            const { data } = await axios.post('/api/jobs', {
                company: newCompany, role: newRole, status: newStatus
            }, { withCredentials: true });
            setJobs([data, ...jobs]);
            setShowAddModal(false);
            setNewCompany(""); setNewRole("");
        } catch (error) {
            console.error("Failed to add job", error);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const updatedJobs = jobs.map(j => j._id === id ? { ...j, status: newStatus as any } : j);
        setJobs(updatedJobs);
        try {
            await axios.put(`/api/jobs/${id}`, { status: newStatus }, { withCredentials: true });
        } catch (error) {
            console.error("Update failed", error);
            fetchJobs();
        }
    };

    const deleteJob = async (id: string) => {
        if(!confirm("Are you sure you want to delete this job?")) return;
        try {
            await axios.delete(`/api/jobs/${id}`, { withCredentials: true });
            setJobs(jobs.filter(j => j._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    if (loading) return <div className="text-text-primary p-8">Loading Board...</div>;

    return (
        <div className="w-full h-full p-4 md:p-8 min-h-screen bg-base-900 text-text-primary">
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text">
                    Job Application Tracker
                </h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-accent-600 to-accent hover:opacity-90 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-accent/20 active:scale-95"
                >
                    + Add New Job
                </button>
            </div>

            {/* Board */}
            <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                {STATUS_COLS.map(status => (
                    <div key={status} className={`min-w-[300px] flex-1 rounded-xl border p-4 flex flex-col shadow-lg backdrop-blur-sm ${
                        status === 'Offer' ? 'bg-base-800/80 border-accent-700/30' :
                        status === 'Rejected' ? 'bg-base-800/80 border-error/20' :
                        'bg-base-800/80 border-base-600/30'
                    }`}>
                        <h3 className={`text-lg font-bold mb-4 px-3 py-1 rounded-lg w-fit ${
                            status === 'Offer' ? 'bg-accent/20 text-accent-200 border border-accent/30' :
                            status === 'Rejected' ? 'bg-error/20 text-error border border-error/30' :
                            status === 'Interview' ? 'bg-accent-800/30 text-accent-300 border border-accent-700/30' :
                            'bg-base-900 text-text-secondary border border-base-600'
                        }`}>
                            {status} <span className="text-sm opacity-60 ml-2">{jobs.filter(j => j.status === status).length}</span>
                        </h3>
                        
                        <div className="space-y-3 flex-1">
                            {jobs.filter(j => j.status === status).map(job => (
                                <div key={job._id} className="bg-base-900/60 p-4 rounded-lg border border-base-600/20 shadow-md hover:border-accent/50 transition-all group relative hover:shadow-lg hover:bg-base-900/80">
                                    <h4 className="font-bold text-text-primary text-lg">{job.company}</h4>
                                    <p className="text-sm text-text-secondary mb-2">{job.role}</p>
                                    <div className="text-xs text-text-secondary/50 mb-2">{new Date(job.dateApplied).toLocaleDateString()}</div>
                                    
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-base-600/30">
                                        <select 
                                            value={job.status}
                                            onChange={(e) => updateStatus(job._id, e.target.value)}
                                            className="bg-base-800 border border-base-600 text-xs rounded px-2 py-1 text-text-secondary outline-none focus:border-accent"
                                        >
                                            {STATUS_COLS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button 
                                            onClick={() => deleteJob(job._id)}
                                            className="text-error hover:text-error/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium hover:underline"
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
                    <div className="bg-base-800 w-full max-w-md p-6 rounded-2xl border border-base-600 shadow-2xl animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-4 border-b border-base-600 pb-2">Add Application</h2>
                        <form onSubmit={handleAddJob} className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Company</label>
                                <input value={newCompany} onChange={e => setNewCompany(e.target.value)}
                                    className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none" required autoFocus />
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Role</label>
                                <input value={newRole} onChange={e => setNewRole(e.target.value)}
                                    className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary focus:ring-2 focus:ring-accent outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Initial Status</label>
                                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                                    className="w-full bg-base-900 border border-base-600 rounded-lg p-2 text-text-primary outline-none focus:ring-2 focus:ring-accent"
                                >
                                    {STATUS_COLS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 rounded-lg bg-base-900 text-text-secondary hover:bg-base-700 border border-base-600 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2 rounded-lg bg-accent text-base-900 font-bold hover:bg-accent-200 transition-colors shadow-lg">
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
