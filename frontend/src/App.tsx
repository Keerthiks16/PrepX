import { useState, useEffect } from 'react';
import InterviewSetup, { type InterviewConfig } from './components/Interview/InterviewSetup';
import InterviewSession from './components/Interview/InterviewSession';
import FeedbackReport from './components/Interview/FeedbackReport';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import JobBoard from './components/Dashboard/JobBoard';
import { useAuthStore } from './store/authStore';

const App = () => {
  // Auth State
  const { user, loading, checkAuth, logout } = useAuthStore();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // App State (Main Views)
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'jobs'>('home');
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Handlers
  const handleStartInterview = (newConfig: InterviewConfig) => {
    setConfig(newConfig);
  };

  const handleEndSession = (data: any) => {
    setFeedbackData(data);
    setConfig(null); 
  };

  const handleRestart = () => {
    setFeedbackData(null);
    setConfig(null);
  };

  if (loading) {
      return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  // Not Logged In -> Show Auth Screens
  if (!user) {
      return (
          <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center p-4">
              {authView === 'login' ? (
                  <Login onSwitch={() => setAuthView('register')} onSuccess={() => {}} />
              ) : (
                  <Register onSwitch={() => setAuthView('login')} onSuccess={() => {}} />
              )}
          </div>
      );
  }

  // Logged In -> Show Main App
  return (
    <div className="min-h-screen w-full bg-gray-900 font-sans text-white">
        {/* Simple Navbar */}
        <nav className="border-b border-gray-800 bg-gray-800/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <div 
                    className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text cursor-pointer"
                    onClick={() => { setCurrentView('home'); setConfig(null); setFeedbackData(null); }}
                >
                    AI Career Assistant
                </div>
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={() => setCurrentView('home')} 
                        className={`text-sm hover:text-white transition-colors ${currentView === 'home' ? 'text-white font-medium' : 'text-gray-400'}`}
                    >
                        Interview
                    </button>
                    <button 
                         onClick={() => { setCurrentView('jobs'); setConfig(null); setFeedbackData(null); }}
                         className={`text-sm hover:text-white transition-colors ${currentView === 'jobs' ? 'text-white font-medium' : 'text-gray-400'}`}
                    >
                        Job Tracker
                    </button>
                    <button 
                         onClick={() => { setCurrentView('profile'); setConfig(null); setFeedbackData(null); }}
                         className={`text-sm hover:text-white transition-colors ${currentView === 'profile' ? 'text-white font-medium' : 'text-gray-400'}`}
                    >
                        Profile
                    </button>
                    <button 
                        onClick={logout}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors ml-4 border border-red-500/30 px-3 py-1 rounded hover:bg-red-500/10"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="">
            {currentView === 'profile' ? (
                <Profile />
            ) : currentView === 'jobs' ? (
                <JobBoard />
            ) : (
                <>
                    {/* Interview Logic */}
                    {!config && !feedbackData ? (
                        <InterviewSetup onStart={handleStartInterview} />
                    ) : feedbackData ? (
                        <FeedbackReport data={feedbackData} onRestart={handleRestart} />
                    ) : (
                        <InterviewSession config={config!} onEndSession={handleEndSession} />
                    )}
                </>
            )}
        </main>
    </div>
  );
};

export default App;