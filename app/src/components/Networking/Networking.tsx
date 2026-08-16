import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Modal, 
  Alert,
  ActivityIndicator,
  Clipboard,
  Platform
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../store/api';
import { COLORS, globalStyles } from '../Common/theme';
import { NETWORKING_TEMPLATES, type TemplateKey } from './templates';

const Networking = () => {
  const { user } = useAuthStore();
  const [recipient, setRecipient] = useState({ name: '', role: '', company: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('Connect - fresher');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom Template Picker Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleGenerate = async () => {
    if (!recipient.name || !recipient.company) {
      Alert.alert('Error', 'Please enter at least recipient name and company');
      return;
    }

    setLoading(true);
    try {
      const userContext = {
        name: user?.name,
        skills: user?.skills?.join(", "),
        projects: user?.projects,
        degree: "B.Tech", 
        college: "Thadomal Shahani Engineering College",
        linkedin: user?.linkedin,
        portfolio: user?.portfolio,
        github: user?.github
      };
      
      const { data } = await api.post('/api/chat/networking-message', {
        userContext,
        recipient,
        templateName: selectedTemplate,
        templateText: NETWORKING_TEMPLATES[selectedTemplate],
        jobDescription
      });
      
      setGeneratedMessage(data.message);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate message");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    try {
      Clipboard.setString(generatedMessage);
      Alert.alert("Success", "Copied to clipboard!");
    } catch (err) {
      Alert.alert("Ready to Copy", "Tap and hold the text below to copy it.");
    }
  };

  const templateKeys = Object.keys(NETWORKING_TEMPLATES) as TemplateKey[];

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={globalStyles.title}>Networking AI Assistant</Text>
      <Text style={globalStyles.subtitle}>Select a template and let AI tailor it to your profile and the opportunity.</Text>

      {/* Form Card */}
      <View style={[globalStyles.card, styles.formCard]}>
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Message Template</Text>
          <TouchableOpacity 
            style={styles.pickerSelector}
            onPress={() => setShowTemplateModal(true)}
          >
            <Text style={styles.pickerSelectorText}>{selectedTemplate}</Text>
            <Text style={styles.pickerSelectorArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Template Preview</Text>
          <Text style={styles.previewText}>
            {NETWORKING_TEMPLATES[selectedTemplate]}
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Recipient Details</Text>
        
        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Name</Text>
          <TextInput
            value={recipient.name}
            onChangeText={(txt) => setRecipient({ ...recipient, name: txt })}
            placeholder="e.g. Sarah Jenkins"
            placeholderTextColor={COLORS.textMuted}
            style={globalStyles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={globalStyles.label}>Role</Text>
            <TextInput
              value={recipient.role}
              onChangeText={(txt) => setRecipient({ ...recipient, role: txt })}
              placeholder="e.g. Recruiter"
              placeholderTextColor={COLORS.textMuted}
              style={globalStyles.input}
            />
          </View>
          
          <View style={styles.flex1}>
            <Text style={globalStyles.label}>Company</Text>
            <TextInput
              value={recipient.company}
              onChangeText={(txt) => setRecipient({ ...recipient, company: txt })}
              placeholder="e.g. Google"
              placeholderTextColor={COLORS.textMuted}
              style={globalStyles.input}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={globalStyles.label}>Job Context / JD (Optional)</Text>
          <TextInput
            multiline
            numberOfLines={3}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Paste short JD here..."
            placeholderTextColor={COLORS.textMuted}
            style={[globalStyles.input, styles.textareaMini]}
          />
        </View>

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={loading || !recipient.name}
          style={[globalStyles.accentButton, (loading || !recipient.name) && styles.disabledBtn]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.bg900} />
          ) : (
            <Text style={globalStyles.accentButtonText}>Generate Optimized Draft 🚀</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Output Card */}
      <View style={[globalStyles.card, styles.outputCard]}>
        <View style={styles.outputHeader}>
          <Text style={styles.outputTitle}>Generated Message</Text>
          {generatedMessage ? (
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
              <Text style={styles.copyBtnText}>Copy Text</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TextInput
          multiline
          editable={true}
          selectTextOnFocus={true}
          value={generatedMessage}
          onChangeText={setGeneratedMessage}
          placeholder="Optimized message will appear here..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.outputArea}
        />
      </View>

      {/* Custom Picker Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Template</Text>
            <ScrollView style={styles.modalScroll}>
              {templateKeys.map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    setSelectedTemplate(key);
                    setShowTemplateModal(false);
                  }}
                  style={[
                    styles.modalOption,
                    selectedTemplate === key && styles.modalOptionActive,
                  ]}
                >
                  <Text style={[
                    styles.modalOptionText,
                    selectedTemplate === key && styles.modalOptionTextActive,
                  ]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => setShowTemplateModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 6,
  },
  pickerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: COLORS.bg600,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerSelectorText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  pickerSelectorArrow: {
    color: COLORS.accent,
    fontSize: 10,
  },
  previewContainer: {
    backgroundColor: COLORS.bg900,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    gap: 6,
  },
  previewLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  textareaMini: {
    height: 80,
    textAlignVertical: 'top',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  outputCard: {
    padding: 16,
    height: 380,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.bg800,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    padding: 20,
    height: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 8,
  },
  modalScroll: {
    flex: 1,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  modalOptionActive: {
    backgroundColor: COLORS.accentGlow,
    borderRadius: 8,
  },
  modalOptionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOptionTextActive: {
    color: COLORS.accentLight,
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    marginTop: 16,
    backgroundColor: COLORS.bg900,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
});

export default Networking;
