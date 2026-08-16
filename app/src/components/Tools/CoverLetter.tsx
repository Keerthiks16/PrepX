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
  Clipboard
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../store/api';
import { COLORS, globalStyles } from '../Common/theme';

const CoverLetter = () => {
  const { user } = useAuthStore();
  const [jobDescription, setJobDescription] = useState('');
  const [company, setCompany] = useState('');
  const [manager, setManager] = useState('');
  const [tone, setTone] = useState<'Professional' | 'Enthusiastic' | 'Confident'>('Professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription) {
      Alert.alert('Error', 'Please enter a job description');
      return;
    }

    setLoading(true);
    try {
      const userContext = {
        name: user?.name,
        role: user?.currentRole,
        skills: user?.skills?.join(", "),
        resumeContext: user?.resumeContext,
        projects: user?.projects
      };
      
      const { data } = await api.post('/api/chat/cover-letter', {
        userContext,
        jobDescription,
        company,
        manager,
        tone
      });
      
      setGeneratedLetter(data.coverLetter);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    try {
      Clipboard.setString(generatedLetter);
      Alert.alert("Success", "Copied to clipboard!");
    } catch (err) {
      // Fallback alert for newer React Native versions if Clipboard is not available
      Alert.alert("Ready to Copy", "Tap and hold the text below to copy it.");
    }
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={globalStyles.title}>AI Cover Letter Writer</Text>
      <Text style={globalStyles.subtitle}>Craft compelling, personalized cover letters in seconds.</Text>

      {/* Form Card */}
      <View style={[globalStyles.card, styles.formCard]}>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={globalStyles.label}>Company Name</Text>
            <TextInput
              value={company}
              onChangeText={setCompany}
              placeholder="e.g. OpenAI"
              placeholderTextColor={COLORS.textMuted}
              style={globalStyles.input}
            />
          </View>
          
          <View style={styles.flex1}>
            <Text style={globalStyles.label}>Hiring Manager</Text>
            <TextInput
              value={manager}
              onChangeText={setManager}
              placeholder="Optional"
              placeholderTextColor={COLORS.textMuted}
              style={globalStyles.input}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Tone</Text>
          <View style={styles.toneContainer}>
            {['Professional', 'Enthusiastic', 'Confident'].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTone(t as any)}
                style={[
                  styles.toneButton,
                  tone === t && styles.toneButtonActive,
                ]}
              >
                <Text style={[
                  styles.toneButtonText,
                  tone === t && styles.toneButtonTextActive,
                ]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Job Description</Text>
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
            <Text style={globalStyles.accentButtonText}>Generate Cover Letter ✍️</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Output Card */}
      <View style={[globalStyles.card, styles.outputCard]}>
        <View style={styles.outputHeader}>
          <Text style={styles.outputTitle}>Your Letter</Text>
          {generatedLetter ? (
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
              <Text style={styles.copyBtnText}>Copy Text</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TextInput
          multiline
          editable={true}
          selectTextOnFocus={true}
          value={generatedLetter}
          onChangeText={setGeneratedLetter}
          placeholder="Your cover letter will appear here..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.outputArea}
        />
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  formGroup: {
    gap: 4,
  },
  toneContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg900,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    padding: 3,
    gap: 4,
  },
  toneButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toneButtonActive: {
    backgroundColor: COLORS.accent,
  },
  toneButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  toneButtonTextActive: {
    color: COLORS.bg900,
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  outputCard: {
    padding: 16,
    height: 400,
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
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.3)',
  },
  copyBtnText: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: 'bold',
  },
  outputArea: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    textAlignVertical: 'top',
    padding: 8,
    backgroundColor: COLORS.bg900,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.bg600,
  },
});

export default CoverLetter;
