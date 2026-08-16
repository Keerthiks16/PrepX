import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Image,
  Platform
} from 'react-native';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';

export type InterviewConfig = {
  role: string;
  skills: string;
  jobDescription: string;
  resumeText: string;
  selectedVoiceURI: string;
  selectedAvatar: string;
  interviewType: 'Classical' | 'Resume' | 'Scenario' | 'Project' | 'Coaching';
  projectContext?: string;
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

// High-fidelity Unsplash Recruiter Avatars for a premium look
const RECRUITER_AVATARS = [
  { name: 'Marcus (Tech Lead)', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' },
  { name: 'Sarah (HR Manager)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' },
  { name: 'Elena (Director of Eng)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200' },
  { name: 'David (Staff Engineer)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' },
];

const PRESET_VOICES = [
  { name: 'Google US English (Female)', uri: 'en-US-SMT-Female' },
  { name: 'Google US English (Male)', uri: 'en-US-SMT-Male' },
  { name: 'Samantha (System Female)', uri: 'Samantha' },
  { name: 'Daniel (System Male)', uri: 'Daniel' }
];

const InterviewSetup = ({ onStart }: InterviewSetupProps) => {
  const [role, setRole] = useState(ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [skills, setSkills] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(PRESET_VOICES[0].uri);
  const [interviewType, setInterviewType] = useState<'Classical' | 'Resume' | 'Scenario' | 'Project'>('Classical');
  const [projectContext, setProjectContext] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(RECRUITER_AVATARS[0].url);
  const [showAvatars, setShowAvatars] = useState(false);

  const handleSubmit = () => {
    const finalRole = isCustomRole ? customRole : role;
    onStart({
      role: finalRole || "Candidate",
      skills,
      jobDescription,
      resumeText,
      selectedVoiceURI,
      selectedAvatar,
      interviewType,
      projectContext
    });
  };

  const types: { id: typeof interviewType; label: string; desc: string; icon: 'briefcase' | 'file-text' | 'users' | 'code' }[] = [
    { id: 'Classical', label: 'Classical', desc: 'Standard Q&A', icon: 'briefcase' },
    { id: 'Resume', label: 'Resume', desc: 'Deep exp dive', icon: 'file-text' },
    { id: 'Scenario', label: 'Scenario', desc: 'Situational tests', icon: 'users' },
    { id: 'Project', label: 'Project', desc: 'Technical Viva', icon: 'code' },
  ];

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={globalStyles.title}>Interview Setup</Text>
      <Text style={globalStyles.subtitle}>Configure your AI-powered simulated job interview.</Text>

      {/* Types Grid */}
      <View style={styles.typesGrid}>
        {types.map((t) => {
          const isActive = interviewType === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setInterviewType(t.id)}
              style={[
                styles.typeBtn,
                isActive && styles.typeBtnActive,
              ]}
            >
              <CustomIcon 
                name={t.icon} 
                size={24} 
                color={isActive ? COLORS.accentLight : COLORS.textSecondary} 
                style={styles.typeIcon}
              />
              <Text style={[styles.typeLabel, isActive && styles.typeLabelActive]}>{t.label}</Text>
              <Text style={styles.typeDesc}>{t.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Setup Form */}
      <View style={[globalStyles.card, styles.formCard]}>
        
        {/* Avatar Selection Row */}
        <View style={styles.avatarPickerContainer}>
          <View style={styles.avatarMainRow}>
            <Image source={{ uri: selectedAvatar }} style={styles.avatarImage} />
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarLabel}>AI Interviewer</Text>
              <Text style={styles.avatarSubText}>
                {RECRUITER_AVATARS.find(a => a.url === selectedAvatar)?.name || 'Elena'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowAvatars(!showAvatars)}
              style={styles.changeInterviewerBtn}
            >
              <Text style={styles.changeInterviewerBtnText}>
                {showAvatars ? 'Close' : 'Change'}
              </Text>
            </TouchableOpacity>
          </View>

          {showAvatars && (
            <View style={styles.avatarGrid}>
              {RECRUITER_AVATARS.map((a, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setSelectedAvatar(a.url);
                    setShowAvatars(false);
                  }}
                  style={[
                    styles.avatarGridItem,
                    selectedAvatar === a.url && styles.avatarGridItemActive,
                  ]}
                >
                  <Image source={{ uri: a.url }} style={styles.gridAvatarImage} />
                  <Text style={styles.gridAvatarLabel} numberOfLines={1}>{a.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Role Select */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Target Role</Text>
          <View style={styles.rolePickerRow}>
            {ROLES.map((r) => {
              const isSelected = !isCustomRole && role === r;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => {
                    setIsCustomRole(false);
                    setRole(r);
                  }}
                  style={[styles.roleTag, isSelected && styles.roleTagActive]}
                >
                  <Text style={[styles.roleTagText, isSelected && styles.roleTagTextActive]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => setIsCustomRole(true)}
              style={[styles.roleTag, isCustomRole && styles.roleTagActive]}
            >
              <Text style={[styles.roleTagText, isCustomRole && styles.roleTagTextActive]}>Other...</Text>
            </TouchableOpacity>
          </View>

          {isCustomRole && (
            <TextInput
              value={customRole}
              onChangeText={setCustomRole}
              placeholder="e.g. React Native Engineer"
              placeholderTextColor={COLORS.textMuted}
              style={[globalStyles.input, styles.customRoleInput]}
              autoFocus
            />
          )}
        </View>

        {/* Project Description (if interviewType === 'Project') */}
        {interviewType === 'Project' && (
          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Project Description / README</Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={projectContext}
              onChangeText={setProjectContext}
              placeholder="Paste your project's README or detailed description here..."
              placeholderTextColor={COLORS.textMuted}
              style={[globalStyles.input, styles.textarea]}
            />
          </View>
        )}

        {/* Tech Stack */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Tech Stack / Skills (Optional)</Text>
          <TextInput
            value={skills}
            onChangeText={setSkills}
            placeholder="e.g. React Native, Redux, Node.js"
            placeholderTextColor={COLORS.textMuted}
            style={globalStyles.input}
          />
        </View>

        {/* Resume summary */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Resume / Experience (Optional)</Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={resumeText}
            onChangeText={setResumeText}
            placeholder="Brief details of your past experience..."
            placeholderTextColor={COLORS.textMuted}
            style={[globalStyles.input, styles.textarea]}
          />
        </View>

        {/* JD context */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Job Description (Optional)</Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Paste target JD here to focus questions..."
            placeholderTextColor={COLORS.textMuted}
            style={[globalStyles.input, styles.textarea]}
          />
        </View>

        {/* Voice Select */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Interviewer Voice</Text>
          <View style={styles.voiceSelectorContainer}>
            {PRESET_VOICES.map((v) => (
              <TouchableOpacity
                key={v.uri}
                onPress={() => setSelectedVoiceURI(v.uri)}
                style={[
                  styles.voiceOption,
                  selectedVoiceURI === v.uri && styles.voiceOptionActive,
                ]}
              >
                <Text style={[
                  styles.voiceOptionText,
                  selectedVoiceURI === v.uri && styles.voiceOptionTextActive,
                ]}>
                  {v.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[globalStyles.accentButton, styles.startBtn]}
        >
          <Text style={globalStyles.accentButtonText}>Start Interview 🚀</Text>
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
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bg800,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentGlow,
  },
  typeIcon: {
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  typeLabelActive: {
    color: COLORS.textPrimary,
  },
  typeDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  formCard: {
    padding: 16,
    gap: 16,
  },
  avatarPickerContainer: {
    backgroundColor: COLORS.bg900,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
  },
  avatarMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  avatarInfo: {
    flex: 1,
    marginLeft: 12,
  },
  avatarLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  avatarSubText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  changeInterviewerBtn: {
    backgroundColor: COLORS.bg700,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  changeInterviewerBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  avatarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  avatarGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  avatarGridItemActive: {
    opacity: 0.5,
  },
  gridAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.bg600,
  },
  gridAvatarLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  formGroup: {
    gap: 4,
  },
  rolePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  roleTag: {
    backgroundColor: COLORS.bg900,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  roleTagActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  roleTagText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  roleTagTextActive: {
    color: COLORS.bg900,
    fontWeight: 'bold',
  },
  customRoleInput: {
    marginTop: 8,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  voiceSelectorContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  voiceOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.bg900,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 8,
  },
  voiceOptionActive: {
    backgroundColor: COLORS.accentGlow,
    borderColor: COLORS.accent,
  },
  voiceOptionText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  voiceOptionTextActive: {
    color: COLORS.accentLight,
  },
  startBtn: {
    marginTop: 8,
  },
});

export default InterviewSetup;
