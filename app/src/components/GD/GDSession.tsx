import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  ActivityIndicator,
  FlatList
} from 'react-native';
import api from '../../store/api';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';
import type { GDConfig } from './GDSetup';

export type GDMessage = {
  role: 'user' | 'assistant' | 'system' | 'mediator';
  sender: string;
  content: string;
};

interface GDSessionProps {
  config: GDConfig;
  userName: string;
  onEndSession: (transcript: GDMessage[]) => void;
}

const GDSession = ({ config, userName, onEndSession }: GDSessionProps) => {
  const [transcript, setTranscript] = useState<GDMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isBotLoading, setIsBotLoading] = useState(false);

  const speakerIndexRef = useRef(-1);
  const botCountSinceUserRef = useRef(0);
  const transcriptRef = useRef<GDMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    setIsSessionActive(true);
    try {
      const response = await api.post('/api/chat/gd-intro', { topic: config.topic });
      const intro = response.data.response;
      const msg: GDMessage = { role: 'mediator', sender: 'Mediator', content: intro };
      
      transcriptRef.current = [msg];
      setTranscript([msg]);
      
      if (config.startWithMe) {
        setActiveSpeaker('User');
        botCountSinceUserRef.current = 0;
      } else {
        getNextBotResponse();
      }
    } catch (error) {
      console.error("Failed to start GD:", error);
    }
  };

  const getNextBotResponse = async () => {
    if (botCountSinceUserRef.current >= config.userSpeakerFrequency) {
      setActiveSpeaker('User');
      return;
    }

    speakerIndexRef.current = (speakerIndexRef.current + 1) % config.participants.length;
    const currentBot = config.participants[speakerIndexRef.current];
    setActiveSpeaker(currentBot.name);
    setIsBotLoading(true);

    try {
      const response = await api.post('/api/chat/gd-chat', {
        topic: config.topic,
        history: transcriptRef.current.map(m => ({ 
          role: m.role === 'user' ? 'user' : 'assistant', 
          content: `${m.sender}: ${m.content}` 
        })),
        currentSpeaker: currentBot
      });

      const aiText = response.data.response;
      const newMsg: GDMessage = { role: 'assistant', sender: currentBot.name, content: aiText };
      
      transcriptRef.current = [...transcriptRef.current, newMsg];
      setTranscript([...transcriptRef.current]);
      botCountSinceUserRef.current += 1;
      setIsBotLoading(false);

      // Wait a moment then get next speaker or user turn
      setTimeout(() => {
        getNextBotResponse();
      }, 2000);
    } catch (error) {
      console.error("GD Chat Error:", error);
      setIsBotLoading(false);
      setActiveSpeaker('User');
    }
  };

  const handleUserSubmit = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");

    const userMsg: GDMessage = { role: 'user', sender: userName, content: text };
    
    transcriptRef.current = [...transcriptRef.current, userMsg];
    setTranscript([...transcriptRef.current]);
    botCountSinceUserRef.current = 0;
    setActiveSpeaker(null);
    
    setTimeout(() => {
      getNextBotResponse();
    }, 1500);
  };

  const handlePassFloor = () => {
    if (activeSpeaker !== 'User') return;
    botCountSinceUserRef.current = 0;
    setActiveSpeaker(null);
    
    setTimeout(() => {
      getNextBotResponse();
    }, 1000);
  };

  const renderMessageItem = ({ item }: { item: GDMessage }) => {
    const isUser = item.role === 'user';
    const isMediator = item.role === 'mediator';

    return (
      <View style={[styles.msgWrapper, isUser ? styles.userMsgWrapper : styles.botMsgWrapper]}>
        <Text style={[
          styles.senderName, 
          isUser ? { color: COLORS.accent } : isMediator ? { color: COLORS.info } : { color: COLORS.textSecondary }
        ]}>
          {item.sender}
        </Text>
        <View style={[
          styles.msgBubble,
          isUser ? styles.userBubble : isMediator ? styles.mediatorBubble : styles.botBubble
        ]}>
          <Text style={[styles.msgText, isMediator && styles.mediatorText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Session Top Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.topicText} numberOfLines={1}>Topic: {config.topic}</Text>
          <Text style={styles.metaText}>{config.participants.length} AI Participants • Speaker Freq: {config.userSpeakerFrequency}</Text>
        </View>

        <TouchableOpacity 
          onPress={() => onEndSession(transcript)}
          style={styles.endBtn}
        >
          <Text style={styles.endBtnText}>End Session</Text>
        </TouchableOpacity>
      </View>

      {/* Live Floor Status Horizontal Bar */}
      <View style={styles.floorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.floorScroll}>
          {/* User Floor Card */}
          <View style={[
            styles.participantPill,
            activeSpeaker === 'User' && styles.activePill
          ]}>
            <View style={[styles.pillDot, activeSpeaker === 'User' && { backgroundColor: COLORS.accent }]} />
            <Text style={[styles.pillName, activeSpeaker === 'User' && { color: COLORS.accent, fontWeight: 'bold' }]}>
              You
            </Text>
            {activeSpeaker === 'User' && (
              <Text style={styles.yourTurnBadge}>YOUR TURN</Text>
            )}
          </View>

          {/* Bots Floor Cards */}
          {config.participants.map((p, idx) => {
            const isActive = activeSpeaker === p.name;
            return (
              <View key={idx} style={[styles.participantPill, isActive && styles.activePill]}>
                <View style={[styles.pillDot, isActive && { backgroundColor: COLORS.accent }]} />
                <Text style={[styles.pillName, isActive && { color: COLORS.accent, fontWeight: 'bold' }]}>
                  {p.name}
                </Text>
                <Text style={styles.personaBadge}>{p.persona}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Transcript Messages */}
      <FlatList
        ref={flatListRef}
        data={transcript}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Bot Thinking Indicator */}
      {isBotLoading && (
        <View style={styles.botThinkingRow}>
          <ActivityIndicator size="small" color={COLORS.accent} />
          <Text style={styles.botThinkingText}>{activeSpeaker} is speaking...</Text>
        </View>
      )}

      {/* Input / Control Bar */}
      <View style={styles.controlBar}>
        {activeSpeaker === 'User' && (
          <View style={styles.floorAlertBanner}>
            <Text style={styles.floorAlertText}>⚡ YOUR FLOOR - SPEAK OR TYPE NOW</Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={activeSpeaker === 'User' ? "Type your thoughts..." : "Wait for your turn in queue..."}
            placeholderTextColor={COLORS.textMuted}
            editable={activeSpeaker === 'User'}
            style={[styles.textInput, activeSpeaker !== 'User' && styles.disabledInput]}
          />

          <TouchableOpacity
            onPress={handleUserSubmit}
            disabled={activeSpeaker !== 'User' || !inputText.trim()}
            style={[styles.sendBtn, (activeSpeaker !== 'User' || !inputText.trim()) && styles.disabledSendBtn]}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>

          {activeSpeaker === 'User' && (
            <TouchableOpacity
              onPress={handlePassFloor}
              style={styles.passBtn}
            >
              <Text style={styles.passBtnText}>Pass Floor</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: COLORS.bg800,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg600,
  },
  headerInfo: {
    flex: 1,
    marginRight: 8,
  },
  topicText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  endBtn: {
    backgroundColor: COLORS.errorGlow,
    borderColor: COLORS.error + '50',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  endBtnText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  floorContainer: {
    backgroundColor: COLORS.bg900,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  floorScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  participantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg800,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    gap: 6,
  },
  activePill: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentGlow,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  pillName: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  yourTurnBadge: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
    backgroundColor: COLORS.bg900,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  personaBadge: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
  messagesContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 20,
  },
  msgWrapper: {
    maxWidth: '85%',
  },
  userMsgWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  botMsgWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  msgBubble: {
    padding: 12,
    borderRadius: 14,
  },
  userBubble: {
    backgroundColor: COLORS.accentGlow,
    borderColor: COLORS.accent + '40',
    borderWidth: 1,
    borderTopRightRadius: 2,
  },
  botBubble: {
    backgroundColor: COLORS.bg800,
    borderColor: COLORS.bg600,
    borderWidth: 1,
    borderTopLeftRadius: 2,
  },
  mediatorBubble: {
    backgroundColor: COLORS.infoGlow,
    borderColor: COLORS.info + '30',
    borderWidth: 1,
    borderTopLeftRadius: 2,
  },
  msgText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 19,
  },
  mediatorText: {
    color: COLORS.info,
    fontStyle: 'italic',
  },
  botThinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  botThinkingText: {
    color: COLORS.accent,
    fontSize: 12,
  },
  controlBar: {
    backgroundColor: COLORS.bg800,
    borderTopWidth: 1,
    borderTopColor: COLORS.bg600,
    padding: 12,
    gap: 8,
  },
  floorAlertBanner: {
    backgroundColor: COLORS.accentGlow,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  floorAlertText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '900',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.bg900,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  disabledInput: {
    opacity: 0.5,
  },
  sendBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSendBtn: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: COLORS.bg900,
    fontWeight: 'bold',
    fontSize: 13,
  },
  passBtn: {
    backgroundColor: COLORS.bg700,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.bg600,
  },
  passBtnText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default GDSession;
