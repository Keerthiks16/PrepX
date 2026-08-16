import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';

export type GDParticipant = {
  name: string;
  persona: 'Excellent' | 'Aggressive' | 'Neutral' | 'Silent';
};

export type GDConfig = {
  topic: string;
  participants: GDParticipant[];
  userSpeakerFrequency: number;
  startWithMe: boolean;
};

interface GDSetupProps {
  onStart: (config: GDConfig) => void;
}

const DEFAULT_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Skyler"];
const PERSONAS: GDParticipant['persona'][] = ['Excellent', 'Aggressive', 'Neutral', 'Silent'];

const GDSetup = ({ onStart }: GDSetupProps) => {
  const [topic, setTopic] = useState("");
  const [numParticipants, setNumParticipants] = useState(4);
  const [participants, setParticipants] = useState<GDParticipant[]>([]);
  const [userFrequency, setUserFrequency] = useState(3);
  const [startWithMe, setStartWithMe] = useState(false);

  useEffect(() => {
    updateParticipants(4);
  }, []);

  const updateParticipants = (count: number) => {
    const newParticipants: GDParticipant[] = [];
    for (let i = 0; i < count; i++) {
      newParticipants.push({
        name: DEFAULT_NAMES[i % DEFAULT_NAMES.length],
        persona: PERSONAS[i % PERSONAS.length]
      });
    }
    setParticipants(newParticipants);
  };

  const handlePersonaChange = (index: number, persona: GDParticipant['persona']) => {
    const updated = [...participants];
    updated[index].persona = persona;
    setParticipants(updated);
  };

  const handleSubmit = () => {
    if (!topic.trim()) {
      Alert.alert("Topic Required", "Please enter a discussion topic");
      return;
    }
    onStart({ topic, participants, userSpeakerFrequency: userFrequency, startWithMe });
  };

  const getPersonaColor = (persona: GDParticipant['persona']) => {
    switch (persona) {
      case 'Excellent': return COLORS.success;
      case 'Aggressive': return COLORS.error;
      case 'Neutral': return COLORS.info;
      case 'Silent': return COLORS.textSecondary;
    }
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={globalStyles.title}>GD Preparation</Text>
      <Text style={globalStyles.subtitle}>Practice group discussions with various AI debate personas.</Text>

      {/* Form Card */}
      <View style={[globalStyles.card, styles.formCard]}>
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>GD Topic</Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Is AI a threat to human jobs?"
            placeholderTextColor={COLORS.textMuted}
            style={globalStyles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={globalStyles.label}>AI Bots (2-8)</Text>
            <View style={styles.countSelector}>
              <TouchableOpacity 
                onPress={() => {
                  const val = Math.max(2, numParticipants - 1);
                  setNumParticipants(val);
                  updateParticipants(val);
                }}
                style={styles.countBtn}
              >
                <Text style={styles.countBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.countValue}>{numParticipants}</Text>
              <TouchableOpacity 
                onPress={() => {
                  const val = Math.min(8, numParticipants + 1);
                  setNumParticipants(val);
                  updateParticipants(val);
                }}
                style={styles.countBtn}
              >
                <Text style={styles.countBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.flex1}>
            <Text style={globalStyles.label}>Speak After Every</Text>
            <View style={styles.countSelector}>
              <TouchableOpacity 
                onPress={() => setUserFrequency(Math.max(1, userFrequency - 1))}
                style={styles.countBtn}
              >
                <Text style={styles.countBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.countValue}>{userFrequency} bots</Text>
              <TouchableOpacity 
                onPress={() => setUserFrequency(Math.min(5, userFrequency + 1))}
                style={styles.countBtn}
              >
                <Text style={styles.countBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Initiative Control Toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleTitle}>Initiative Control</Text>
            <Text style={styles.toggleDesc}>Start the group discussion yourself.</Text>
          </View>
          <Switch
            value={startWithMe}
            onValueChange={setStartWithMe}
            trackColor={{ false: COLORS.bg700, true: COLORS.accentGlow }}
            thumbColor={startWithMe ? COLORS.accent : COLORS.textSecondary}
          />
        </View>

        {/* Customize participants */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Customize Debate Personas</Text>
          <View style={styles.participantsList}>
            {participants.map((p, idx) => (
              <View key={idx} style={styles.participantItem}>
                <View style={styles.partHeader}>
                  <Text style={styles.partName}>
                    Bot {idx + 1}: {p.name}
                  </Text>
                  <View style={[styles.personaBadge, { backgroundColor: getPersonaColor(p.persona) + '15', borderColor: getPersonaColor(p.persona) }]}>
                    <Text style={[styles.personaBadgeText, { color: getPersonaColor(p.persona) }]}>
                      {p.persona}
                    </Text>
                  </View>
                </View>

                <View style={styles.personaOptions}>
                  {PERSONAS.map((pers) => (
                    <TouchableOpacity
                      key={pers}
                      onPress={() => handlePersonaChange(idx, pers)}
                      style={[
                        styles.personaOptionBtn,
                        p.persona === pers && { backgroundColor: getPersonaColor(pers), borderColor: getPersonaColor(pers) }
                      ]}
                    >
                      <Text style={[
                        styles.personaOptionText,
                        p.persona === pers && { color: COLORS.bg900, fontWeight: 'bold' }
                      ]}>
                        {pers}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={globalStyles.accentButton}
        >
          <Text style={globalStyles.accentButtonText}>Start GD Session 💬</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 80,
  },
  formCard: {
    padding: 16,
    gap: 16,
  },
  formGroup: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  countSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: COLORS.bg600,
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
  },
  countBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.bg700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBtnText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  countValue: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bg900,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggleTitle: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  participantsList: {
    gap: 12,
    marginTop: 4,
  },
  participantItem: {
    backgroundColor: COLORS.bg900,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    padding: 12,
    gap: 8,
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  personaBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  personaBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  personaOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  personaOptionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: COLORS.bg800,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.bg600,
  },
  personaOptionText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
});

export default GDSetup;
