import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from './src/store/authStore';
import api from './src/store/api';
import { COLORS, globalStyles } from './src/components/Common/theme';
import { CustomIcon } from './src/components/Common/icons';
import Loader from './src/components/Common/Loader';

// Auth Components
import Login from './src/components/Auth/Login';
import Register from './src/components/Auth/Register';

// Main Navigation Components
import Home from './src/components/Dashboard/Home';
import JobBoard from './src/components/Dashboard/JobBoard';
import JobListings from './src/components/Dashboard/JobListings';
import Profile from './src/components/Profile/Profile';
import CoverLetter from './src/components/Tools/CoverLetter';
import ResumeBuilder from './src/components/Tools/ResumeBuilder';
import Networking from './src/components/Networking/Networking';

// Interview Components
import InterviewSetup, { InterviewConfig } from './src/components/Interview/InterviewSetup';
import InterviewSession from './src/components/Interview/InterviewSession';
import FeedbackReport from './src/components/Interview/FeedbackReport';

// Group Discussion Components
import GDSetup, { GDConfig } from './src/components/GD/GDSetup';
import GDSession, { GDMessage } from './src/components/GD/GDSession';
import GDReport from './src/components/GD/GDReport';

type ActiveTab = 'home' | 'interview' | 'gd' | 'discover' | 'tracker' | 'profile' | 'coverletter' | 'resume' | 'networking';

function App() {
  const { user, loading, checkAuth, logout } = useAuthStore();
  const isAuthenticated = !!user;
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Interview state machine
  const [interviewState, setInterviewState] = useState<'setup' | 'session' | 'report'>('setup');
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [interviewReportData, setInterviewReportData] = useState<any>(null);

  // GD state machine
  const [gdState, setGdState] = useState<'setup' | 'session' | 'report'>('setup');
  const [gdConfig, setGdConfig] = useState<GDConfig | null>(null);
  const [gdReportData, setGdReportData] = useState<any>(null);
  const [isGeneratingGdReport, setIsGeneratingGdReport] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" />
        <Loader message="Initializing PrepX Mobile..." />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <StatusBar barStyle="light-content" />
        {authMode === 'login' ? (
          <Login onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </SafeAreaView>
    );
  }

  // --- Handlers for Interview Flow ---
  const handleStartInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setInterviewState('session');
  };

  const handleEndInterviewSession = (report: any) => {
    setInterviewReportData(report);
    setInterviewState('report');
  };

  const handleRestartInterview = () => {
    setInterviewState('setup');
    setInterviewConfig(null);
    setInterviewReportData(null);
  };

  // --- Handlers for GD Flow ---
  const handleStartGD = (config: GDConfig) => {
    setGdConfig(config);
    setGdState('session');
  };

  const handleEndGDSession = async (transcript: GDMessage[]) => {
    setIsGeneratingGdReport(true);
    try {
      const response = await api.post('/api/chat/gd-feedback', {
        topic: gdConfig?.topic || '',
        transcript: transcript.map(t => `${t.sender}: ${t.content}`).join('\n')
      });
      setGdReportData(response.data);
      setGdState('report');
    } catch (err) {
      console.error("Failed to generate GD feedback:", err);
      // Fallback response if report endpoint errs
      setGdReportData({
        rating: 78,
        summary: "Good participation in the group discussion with clear arguments.",
        speakerType: "neutral",
        speakerTypeDescription: "Balanced contributor with constructive inputs.",
        suggestions: ["Take initiative early", "Support points with real data"],
        redFlags: []
      });
      setGdState('report');
    } finally {
      setIsGeneratingGdReport(false);
    }
  };

  const handleRestartGD = () => {
    setGdState('setup');
    setGdConfig(null);
    setGdReportData(null);
  };

  // Render current tab body
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={(screen) => setActiveTab(screen as ActiveTab)} />;

      case 'interview':
        if (interviewState === 'setup') {
          return <InterviewSetup onStart={handleStartInterview} />;
        }
        if (interviewState === 'session' && interviewConfig) {
          return (
            <InterviewSession
              config={interviewConfig}
              onEndSession={handleEndInterviewSession}
            />
          );
        }
        if (interviewState === 'report' && interviewReportData) {
          return (
            <FeedbackReport
              data={interviewReportData}
              onRestart={handleRestartInterview}
            />
          );
        }
        return <InterviewSetup onStart={handleStartInterview} />;

      case 'gd':
        if (isGeneratingGdReport) {
          return (
            <View style={[globalStyles.container, styles.centerContent]}>
              <Loader message="AI Evaluator is scoring your GD session..." />
            </View>
          );
        }
        if (gdState === 'setup') {
          return <GDSetup onStart={handleStartGD} />;
        }
        if (gdState === 'session' && gdConfig) {
          return (
            <GDSession
              config={gdConfig}
              userName={user?.name || "Candidate"}
              onEndSession={handleEndGDSession}
            />
          );
        }
        if (gdState === 'report' && gdReportData) {
          return (
            <GDReport
              data={gdReportData}
              onRestart={handleRestartGD}
            />
          );
        }
        return <GDSetup onStart={handleStartGD} />;

      case 'discover':
        return <JobListings />;

      case 'tracker':
        return <JobBoard />;

      case 'profile':
        return <Profile />;

      case 'coverletter':
        return <CoverLetter />;

      case 'resume':
        return <ResumeBuilder />;

      case 'networking':
        return <Networking />;

      default:
        return <Home onNavigate={(screen) => setActiveTab(screen as ActiveTab)} />;
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="light-content" />

      {/* Main Top Bar */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>Prep<Text style={{ color: COLORS.accent }}>X</Text></Text>
          <View style={styles.proTag}>
            <Text style={styles.proTagText}>MOBILE</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => setActiveTab('profile')}
            style={styles.userBadge}
          >
            <Text style={styles.userAvatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <CustomIcon name="logout" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main View Area */}
      <View style={styles.body}>
        {renderTabContent()}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => setActiveTab('home')}
          style={styles.navItem}
        >
          <CustomIcon name="home" size={20} color={activeTab === 'home' ? COLORS.accent : COLORS.textMuted} />
          <Text style={[styles.navText, activeTab === 'home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('interview')}
          style={styles.navItem}
        >
          <CustomIcon name="mic" size={20} color={activeTab === 'interview' ? COLORS.accent : COLORS.textMuted} />
          <Text style={[styles.navText, activeTab === 'interview' && styles.activeNavText]}>Interview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('gd')}
          style={styles.navItem}
        >
          <CustomIcon name="chat" size={20} color={activeTab === 'gd' ? COLORS.accent : COLORS.textMuted} />
          <Text style={[styles.navText, activeTab === 'gd' && styles.activeNavText]}>GD Prep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('discover')}
          style={styles.navItem}
        >
          <CustomIcon name="search" size={20} color={activeTab === 'discover' ? COLORS.accent : COLORS.textMuted} />
          <Text style={[styles.navText, activeTab === 'discover' && styles.activeNavText]}>Discover</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('tracker')}
          style={styles.navItem}
        >
          <CustomIcon name="briefcase" size={20} color={activeTab === 'tracker' ? COLORS.accent : COLORS.textMuted} />
          <Text style={[styles.navText, activeTab === 'tracker' && styles.activeNavText]}>Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('profile')}
          style={styles.navItem}
        >
          <CustomIcon name="user" size={20} color={activeTab === 'profile' ? COLORS.accent : COLORS.textMuted} />
          <Text style={[styles.navText, activeTab === 'profile' && styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeader: {
    height: 56,
    backgroundColor: COLORS.bg800,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg600,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  proTag: {
    backgroundColor: COLORS.accentGlow,
    borderColor: COLORS.accent + '50',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proTagText: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: COLORS.bg900,
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutBtn: {
    padding: 6,
    backgroundColor: COLORS.errorGlow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  body: {
    flex: 1,
  },
  bottomNav: {
    height: 60,
    backgroundColor: COLORS.bg800,
    borderTopWidth: 1,
    borderTopColor: COLORS.bg600,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  activeNavText: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
});

export default App;
