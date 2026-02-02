import { useState } from 'react';

export type InterviewConfig = {
  role: string;
  skills: string;
  jobDescription: string;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ role, skills, jobDescription });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-xl w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Interview Setup
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Role</label>
            <div className="space-y-3">
              <select 
                value={ROLES.includes(role) ? role : "Other"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "Other") {
                    setRole(""); // Clear role to force user to type
                  } else {
                    setRole(val);
                  }
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                <option value="Other">Other (Type manually)</option>
              </select>

              {/* Show input if role is not in the predefined list or if user selected Other (which sets role to "") */}
              {(!ROLES.includes(role) || role === "") && (
                <input 
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Type your specific role (e.g. iOS Developer)"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none animate-fade-in"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Skills Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack / Skills (Optional)</label>
            <input 
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, AWS, Kubernetes"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
            />
          </div>

          {/* Job Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Description (Optional)</label>
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Start Interview
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterviewSetup;
