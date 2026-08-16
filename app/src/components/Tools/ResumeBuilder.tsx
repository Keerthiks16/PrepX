import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator,
  Clipboard,
  Platform
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../store/api';
import { COLORS, globalStyles } from '../Common/theme';

type StrategyMode = 'Restructure' | 'Blend' | 'Aggressive';

const ResumeBuilder = () => {
  const { user } = useAuthStore();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState(user?.resumeContext || '');
  const [targetRole, setTargetRole] = useState(user?.currentRole || '');
  const [mode, setMode] = useState<StrategyMode>('Restructure');
  const [generatedLatex, setGeneratedLatex] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription) {
      Alert.alert('Error', 'Please enter the job description');
      return;
    }

    setLoading(true);
    try {
      const userContext = {
        name: user?.name,
        email: user?.email,
        linkedin: user?.linkedin,
        github: user?.github,
        portfolio: user?.portfolio,
        role: user?.currentRole,
        skills: user?.skills?.join(", "),
        resumeContext: user?.resumeContext,
        projects: user?.projects,
        experience: user?.resumeContext
      };
      
      const { data } = await api.post('/api/chat/resume-latex', {
        userContext,
        jobDescription,
        mode,
        resumeContent: resumeText,
        targetRole
      });
      
      setGeneratedLatex(data.latexCode);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate resume code");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    try {
      Clipboard.setString(generatedLatex);
      Alert.alert("Success", "Copied LaTeX code! Paste it into Overleaf.com");
    } catch (err) {
      Alert.alert("Ready to Copy", "Tap and hold the text below to copy the LaTeX code.");
    }
  };

  const strategies: { id: StrategyMode; label: string; desc: string; activeColor: string }[] = [
    { 
      id: 'Restructure', 
      label: 'Restructure', 
      desc: 'Optimize layout & keywords. 100% Truthful.',
      activeColor: COLORS.accentLight
    },
    { 
      id: 'Blend', 
      label: 'Blend', 
      desc: 'Add 1 targeted "suggested" project to bridge gaps.',
      activeColor: COLORS.accent
    },
    { 
      id: 'Aggressive', 
      label: 'Aggressive Match', 
      desc: 'Heavily tailored. "Fake it til you make it" style.',
      activeColor: COLORS.error
    }
  ];

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={globalStyles.title}>AI Resume Architect</Text>
      <Text style={globalStyles.subtitle}>Generate ATS-optimized LaTeX resumes tailored to specific job descriptions.</Text>

      {/* Form Card */}
      <View style={[globalStyles.card, styles.formCard]}>
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Target Role</Text>
          <TextInput
            value={targetRole}
            onChangeText={setTargetRole}
            placeholder="e.g. Full Stack Developer"
            placeholderTextColor={COLORS.textMuted}
            style={globalStyles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Current Resume Content</Text>
          <TextInput
            multiline
            numberOfLines={5}
            value={resumeText}
            onChangeText={setResumeText}
            placeholder="Paste your current resume content here..."
            placeholderTextColor={COLORS.textMuted}
            style={[globalStyles.input, styles.textareaMini]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Strategy Mode</Text>
          <View style={styles.strategyList}>
            {strategies.map((strat) => (
              <TouchableOpacity
                key={strat.id}
                onPress={() => setMode(strat.id)}
                style={[
                  styles.strategyBtn,
                  mode === strat.id && { borderColor: strat.activeColor, backgroundColor: 'rgba(255, 255, 255, 0.02)' }
                ]}
              >
                <View style={styles.strategyRow}>
                  <View style={[
                    styles.radioCircle,
                    mode === strat.id && { borderColor: strat.activeColor }
                  ]}>
                    {mode === strat.id && <View style={[styles.radioDot, { backgroundColor: strat.activeColor }]} />}
                  </View>
                  <View style={styles.strategyTextCol}>
                    <Text style={[
                      styles.strategyLabel,
                      mode === strat.id && { color: strat.activeColor }
                    ]}>
                      {strat.label}
                    </Text>
                    <Text style={styles.strategyDesc}>{strat.desc}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Target Job Description</Text>
          <TextInput
            multiline
            numberOfLines={6}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Paste the target job description here..."
            placeholderTextColor={COLORS.textMuted}
            style={[globalStyles.input, styles.textarea]}
          />
        </View>

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={loading || !jobDescription}
          style={[globalStyles.accentButton, (loading || !jobDescription) && styles.disabledBtn]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.bg900} />
          ) : (
            <Text style={globalStyles.accentButtonText}>Generate LaTeX Code ⚡</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Output Card */}
      <View style={[globalStyles.card, styles.outputCard]}>
        <View style={styles.outputHeader}>
          <Text style={styles.outputTitle}>Generated LaTeX Source</Text>
          {generatedLatex ? (
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
              <Text style={styles.copyBtnText}>Copy Code</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TextInput
          multiline
          editable={false}
          selectTextOnFocus={true}
          value={generatedLatex}
          placeholder="LaTeX code will appear here..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.outputArea}
        />
        
        <Text style={styles.tipText}>
          Tip: Create a new project on Overleaf.com and paste this code into main.tex
        </Text>
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
  textareaMini: {
    height: 100,
    textAlignVertical: 'top',
  },
  textarea: {
    height: 140,
    textAlignVertical: 'top',
  },
  strategyList: {
    gap: 10,
    marginTop: 4,
  },
  strategyBtn: {
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  strategyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strategyTextCol: {
    flex: 1,
  },
  strategyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  strategyDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  outputCard: {
    padding: 16,
    height: 420,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 8,
  },
  outputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  copyBtn: {
    backgroundColor: COLORS.bg900,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.bg600,
  },
  copyBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  outputArea: {
    flex: 1,
    color: COLORS.accentLight,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    textAlignVertical: 'top',
    padding: 10,
    backgroundColor: COLORS.bg900,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.bg600,
  },
  tipText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ResumeBuilder;
