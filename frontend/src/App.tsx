import { useState, useEffect } from 'react';
import InterviewSetup, { type InterviewConfig } from './components/Interview/InterviewSetup';
import InterviewSession from './components/Interview/InterviewSession';
import FeedbackReport from './components/Interview/FeedbackReport';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import JobBoard from './components/Dashboard/JobBoard';
import Networking from './components/Networking/Networking';
import ResumeBuilder from './components/Tools/ResumeBuilder';
import { useAuthStore } from './store/authStore';
import CoverLetter from './components/Tools/CoverLetter';

const App = () => {
  // Auth State
  const { user, loading, checkAuth, logout } = useAuthStore();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // App State (Main Views)
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'jobs' | 'networking' | 'resume' | 'cover-letter'>('home');
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
  };

  const handleStartCoaching = () => {
    if (config) {
        setConfig({ ...config, interviewType: 'Coaching' });
        setFeedbackData(null);
    }
  };

  const handleRestart = () => {
    setFeedbackData(null);
    setConfig(null);
  };

  if (loading) {
      return <div className="min-h-screen bg-base-900 flex items-center justify-center text-text-primary">Loading...</div>;
  }

  // Not Logged In -> Show Auth Screens
  if (!user) {
      return (
          <div className="min-h-screen w-full bg-base-900 flex items-center justify-center p-4">
              {authView === 'login' ? (
                  <Login onSwitch={() => setAuthView('register')} onSuccess={() => {}} />
              ) : (
                  <Register onSwitch={() => setAuthView('login')} onSuccess={() => {}} />
              )}
          </div>
      );
  }

  const navItems = [
    { id: 'jobs',          label: 'Jobs' },
    { id: 'resume',        label: 'Resume' },
    { id: 'cover-letter',  label: 'Cover Letter' },
    { id: 'networking',    label: 'Networking' },
  ];

  // Logged In -> Show Main App
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-base-900 via-base-800 to-base-900 font-sans text-text-primary">
        {/* Navbar */}
        <nav className="border-b border-base-600/50 bg-base-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg"> 
            <div className="w-full px-6 md:px-12 py-4 flex justify-between items-center">
                <div 
                    className="text-2xl font-extrabold bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => { setCurrentView('home'); setConfig(null); setFeedbackData(null); }}
                >
                    <img src="/logo5.png" alt="Logo" className="h-20 w-auto" />
                </div>
                <div className="hidden md:flex gap-8 items-center">
                    <div className="flex bg-base-900 p-1 rounded-full border border-base-600/50">
                        {navItems.map((item) => {
                            const isActive = currentView === item.id;
                            return (
                                <button 
                                    key={item.id}
                                    onClick={() => { setCurrentView(item.id as any); setConfig(null); setFeedbackData(null); }}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-accent text-base-900 shadow-[0_0_15px_rgba(0,184,148,0.3)]' 
                                            : 'text-text-secondary hover:text-text-primary hover:bg-base-700/50'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    <button 
                         onClick={() => { setCurrentView('profile'); setConfig(null); setFeedbackData(null); }}
                         className={`text-sm font-semibold tracking-wide transition-all ${currentView === 'profile' ? 'text-accent-200 border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        Profile
                    </button>
                    <button 
                        onClick={logout}
                        className="text-sm text-error/80 hover:text-error transition-colors ml-4 border border-error/20 px-4 py-1.5 rounded-full hover:bg-error/10 font-medium"
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
            ): currentView === 'cover-letter' ? (
                <CoverLetter/>
            ) : currentView === 'networking' ? (
                <Networking />
            ) : currentView === 'resume' ? (
                <ResumeBuilder />
            ) : (
                <>
                    {/* Interview Logic */}
                    {!config && !feedbackData ? (
                        <InterviewSetup onStart={handleStartInterview} />
                    ) : feedbackData ? (
                        <FeedbackReport 
                            data={feedbackData} 
                            onRestart={handleRestart} 
                            onCoaching={config?.interviewType === 'Project' ? handleStartCoaching : undefined}
                        />
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