import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import api from '../../store/api';
import AudioVisualizer from './AudioVisualizer';
import Controls from './Controls';
import type { InterviewConfig } from './InterviewSetup';
import { COLORS, globalStyles } from '../Common/theme';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface InterviewSessionProps {
  config: InterviewConfig;
  onEndSession: (feedbackData: any) => void;
}

const InterviewSession = ({ config, onEndSession }: InterviewSessionProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [viewMode, setViewMode] = useState<'visual' | 'transcript'>('visual');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<any>(null);

  const startSession = () => {
    setIsActive(true);
    const greeting = `Hello! I'm your AI Interviewer for the ${config.role} position. Please introduce yourself.`;
    const initialMsg: Message = { role: 'assistant', content: greeting };
    setTranscript([initialMsg]);
    simulateSpeaking(greeting);
  };

  const simulateSpeaking = (text: string) => {
    setIsSpeaking(true);
    // Simulate talking animation based on length of text
    const duration = Math.min(Math.max(text.length * 40, 2000), 8000);
    setTimeout(() => {
      setIsSpeaking(false);
    }, duration);
  };

  const handleUserResponse = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { role: 'user', content: text };
    const updatedHistory = [...transcript, newUserMsg];
    setTranscript(updatedHistory);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/api/chat', {
        message: text,
        history: transcript,
        context: config 
      });
      
      const aiText = response.data.response;
      const newAiMsg: Message = { role: 'assistant', content: aiText };
      setTranscript(prev => [...prev, newAiMsg]);
      simulateSpeaking(aiText);
    } catch (error) {
      console.error("Error communicating with backend:", error);
      Alert.alert("Connection Error", "Could not reach the AI server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulated Dictation feedback on mobile to keep build 100% robust
      Alert.alert(
        "Voice Input",
        "Voice recording requires native micro-linkages. Use the manual text field below to type your response, or type dictation commands.",
        [{ text: "OK", onPress: () => setIsListening(false) }]
      );
    }
  };

  const endSession = async () => {
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setLoading(true);

    try {
      const response = await api.post('/api/chat/feedback', {
        history: transcript,
        context: config
      });
      onEndSession(response.data);
    } catch (error) {
      console.error("Failed to generate feedback:", error);
      onEndSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'transcript' && scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [transcript, viewMode]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={globalStyles.title}>AI Interviewer</Text>
          <Text style={styles.subtitleHeader}>
            {config.role} • {config.interviewType}
          </Text>
        </View>

        <View style={styles.viewModeSelector}>
          <TouchableOpacity
            onPress={() => setViewMode('visual')}
            style={[styles.modeTab, viewMode === 'visual' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabLabel, viewMode === 'visual' && styles.modeTabLabelActive]}>
              Recruiter
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setViewMode('transcript')}
            style={[styles.modeTab, viewMode === 'transcript' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabLabel, viewMode === 'transcript' && styles.modeTabLabelActive]}>
              Chat
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.sessionContainer}>
        {viewMode === 'visual' ? (
          <View style={styles.visualContainer}>
            <View style={styles.avatarWrapper}>
              <View style={[
                styles.avatarGlowBorder, 
                isSpeaking && styles.avatarGlowBorderActive
              ]}>
                <Image 
                  source={{ uri: config.selectedAvatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" }} 
                  style={styles.interviewerImage} 
                />
              </View>
              
              <View style={[
                styles.statusIndicator, 
                isSpeaking ? styles.statusSpeaking : isListening ? styles.statusListening : styles.statusIdle
              ]} />
            </View>

            {/* Simulated Live Visualizer Wave */}
            <View style={styles.visualizerBox}>
              <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} />
            </View>
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.transcriptScroll}
          >
            {transcript.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <View key={idx} style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
                  <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleBot]}>
                    <Text style={isUser ? styles.msgTextUser : styles.msgTextBot}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              );
            })}
            {loading && (
              <View style={styles.msgRowBot}>
                <View style={[styles.msgBubbleBot, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color={COLORS.accent} />
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Controls & Typing Inputs */}
      <View style={styles.footer}>
        <Controls
          isActive={isActive}
          isListening={isListening}
          onStart={startSession}
          onEnd={endSession}
          onToggleMic={toggleMic}
        />

        {isActive && (
          <View style={styles.typingRow}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your answer here..."
              placeholderTextColor={COLORS.textMuted}
              style={[globalStyles.input, styles.typingInput]}
              onSubmitEditing={() => handleUserResponse(inputText)}
            />
            <TouchableOpacity 
              onPress={() => handleUserResponse(inputText)}
              style={styles.sendButton}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  subtitleHeader: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg800,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 2,
  },
  modeTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: COLORS.accent,
  },
  modeTabLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  modeTabLabelActive: {
    color: COLORS.bg900,
    fontWeight: 'bold',
  },
  sessionContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  visualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 40,
  },
  avatarGlowBorder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: COLORS.bg700,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlowBorderActive: {
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  interviewerImage: {
    width: 184,
    height: 184,
    borderRadius: 92,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 20,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: COLORS.bg900,
  },
  statusSpeaking: {
    backgroundColor: COLORS.accent,
  },
  statusListening: {
    backgroundColor: COLORS.error,
  },
  statusIdle: {
    backgroundColor: COLORS.textMuted,
  },
  visualizerBox: {
    width: '100%',
    paddingHorizontal: 20,
  },
  transcriptScroll: {
    padding: 16,
    gap: 12,
  },
  msgRow: {
    width: '100%',
    flexDirection: 'row',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowBot: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  msgBubbleUser: {
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: 2,
  },
  msgBubbleBot: {
    backgroundColor: COLORS.bg800,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  msgTextUser: {
    color: COLORS.bg900,
    fontSize: 14,
    fontWeight: '500',
  },
  msgTextBot: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.bg900,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  typingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typingInput: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: COLORS.bg900,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default InterviewSession;
