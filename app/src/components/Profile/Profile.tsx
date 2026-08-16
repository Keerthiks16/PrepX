import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Modal, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuthStore, type User } from '../../store/authStore';
import api from '../../store/api';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';
import Loader from '../Common/Loader';

const Profile = () => {
  const { user, login } = useAuthStore();
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Resume Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [rawResume, setRawResume] = useState("");
  const [generating, setGenerating] = useState(false);

  // New Skill Input state
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        skills: user.skills || [],
        resumeContext: user.resumeContext || "",
        experienceLevel: user.experienceLevel || "Entry",
        projects: user.projects || [],
        groqApiKey: user.groqApiKey || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        portfolio: user.portfolio || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/api/auth/profile', formData);
      login(data);
      setMsg("Profile Updated!");
      setIsEditing(false);
      setTimeout(() => setMsg(""), 3000);
    } catch (error) {
      console.error("Update failed", error);
      setMsg("Failed to update profile.");
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const addProject = () => {
    const newProject = { title: "New Project", description: "", workflow: "", githubLink: "", deploymentLink: "" };
    setFormData({ ...formData, projects: [...(formData.projects || []), newProject] });
  };

  const updateProject = (index: number, field: string, value: string) => {
    const updatedProjects = [...(formData.projects || [])];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setFormData({ ...formData, projects: updatedProjects });
  };

  const removeProject = (index: number) => {
    const updatedProjects = [...(formData.projects || [])];
    updatedProjects.splice(index, 1);
    setFormData({ ...formData, projects: updatedProjects });
  };

  const handleAddSkill = () => {
    const val = newSkill.trim();
    if (val && !formData.skills?.includes(val)) {
      setFormData({ ...formData, skills: [...(formData.skills || []), val] });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = [...(formData.skills || [])];
    newSkills.splice(index, 1);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleGenerateSummary = async () => {
    if (!rawResume.trim()) return;
    setGenerating(true);
    try {
      const { data } = await api.post('/api/chat/resume-summary', { resumeText: rawResume });
      setFormData({ ...formData, resumeContext: data.summary });
      setShowResumeModal(false);
      setRawResume("");
      Alert.alert("Success", "Profile summary updated from resume!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  if (!user) return <Loader />;

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>My Profile</Text>
        <TouchableOpacity
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          style={[
            globalStyles.accentButton,
            styles.headerBtn,
            !isEditing && styles.headerBtnEdit,
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.bg900} />
          ) : (
            <Text style={[globalStyles.accentButtonText, !isEditing && styles.headerBtnEditText]}>
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {msg ? (
          <View style={styles.notification}>
            <Text style={styles.notificationText}>{msg}</Text>
          </View>
        ) : null}

        {/* Basic Info */}
        <View style={[globalStyles.card, styles.sectionCard]}>
          <Text style={styles.sectionTitle}>Basic Info</Text>

          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Name</Text>
            <TextInput
              editable={isEditing}
              value={formData.name || ""}
              onChangeText={(txt) => setFormData({ ...formData, name: txt })}
              style={[globalStyles.input, !isEditing && styles.disabledInput]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Email</Text>
            <TextInput
              editable={false}
              value={user.email}
              style={[globalStyles.input, styles.disabledInput]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Experience Level</Text>
            {isEditing ? (
              <View style={styles.experiencePicker}>
                {['Entry', 'Mid', 'Senior'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setFormData({ ...formData, experienceLevel: level })}
                    style={[
                      styles.expOption,
                      formData.experienceLevel === level && styles.expOptionActive,
                    ]}
                  >
                    <Text style={[
                      styles.expOptionText,
                      formData.experienceLevel === level && styles.expOptionTextActive,
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                editable={false}
                value={`${formData.experienceLevel || "Entry"} Level`}
                style={[globalStyles.input, styles.disabledInput]}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Groq API Key (Optional)</Text>
            <TextInput
              editable={isEditing}
              secureTextEntry
              value={formData.groqApiKey || ""}
              onChangeText={(txt) => setFormData({ ...formData, groqApiKey: txt })}
              placeholder="gsk_..."
              placeholderTextColor={COLORS.textMuted}
              style={[globalStyles.input, !isEditing && styles.disabledInput]}
            />
            <Text style={styles.helpText}>Provide your key to bypass rate limits.</Text>
          </View>
        </View>

        {/* Skills & Links */}
        <View style={[globalStyles.card, styles.sectionCard]}>
          <Text style={styles.sectionTitle}>Skills & Resume</Text>

          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Skills</Text>
            <View style={styles.skillsWrapper}>
              {formData.skills?.map((skill, idx) => (
                <View key={idx} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                  {isEditing && (
                    <TouchableOpacity onPress={() => handleRemoveSkill(idx)} style={styles.removeSkillBtn}>
                      <Text style={styles.removeSkillText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {isEditing && (
              <View style={styles.addSkillRow}>
                <TextInput
                  value={newSkill}
                  onChangeText={setNewSkill}
                  placeholder="e.g. TypeScript"
                  placeholderTextColor={COLORS.textMuted}
                  style={[globalStyles.input, styles.addSkillInput]}
                  onSubmitEditing={handleAddSkill}
                />
                <TouchableOpacity onPress={handleAddSkill} style={styles.addSkillBtn}>
                  <Text style={styles.addSkillBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Links */}
          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>LinkedIn URL</Text>
            <TextInput
              editable={isEditing}
              value={formData.linkedin || ""}
              onChangeText={(txt) => setFormData({ ...formData, linkedin: txt })}
              placeholder="https://linkedin.com/in/..."
              placeholderTextColor={COLORS.textMuted}
              style={[globalStyles.input, !isEditing && styles.disabledInput]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>GitHub URL</Text>
            <TextInput
              editable={isEditing}
              value={formData.github || ""}
              onChangeText={(txt) => setFormData({ ...formData, github: txt })}
              placeholder="https://github.com/..."
              placeholderTextColor={COLORS.textMuted}
              style={[globalStyles.input, !isEditing && styles.disabledInput]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Portfolio URL</Text>
            <TextInput
              editable={isEditing}
              value={formData.portfolio || ""}
              onChangeText={(txt) => setFormData({ ...formData, portfolio: txt })}
              placeholder="https://myportfolio.com"
              placeholderTextColor={COLORS.textMuted}
              style={[globalStyles.input, !isEditing && styles.disabledInput]}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.resumeHeader}>
              <Text style={globalStyles.label}>Resume Context</Text>
              {isEditing && (
                <TouchableOpacity onPress={() => setShowResumeModal(true)}>
                  <Text style={styles.resumeAutoBtn}>✨ Autogenerate</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              editable={isEditing}
              multiline
              numberOfLines={4}
              value={formData.resumeContext || ""}
              onChangeText={(txt) => setFormData({ ...formData, resumeContext: txt })}
              placeholder="Summary of experience..."
              placeholderTextColor={COLORS.textMuted}
              style={[globalStyles.input, styles.textarea, !isEditing && styles.disabledInput]}
            />
          </View>
        </View>

        {/* Projects */}
        <View style={[globalStyles.card, styles.sectionCard]}>
          <View style={styles.resumeHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {isEditing && (
              <TouchableOpacity onPress={addProject} style={styles.addProjBtn}>
                <Text style={styles.addProjBtnText}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.projectsList}>
            {formData.projects?.map((proj, idx) => (
              <View key={idx} style={styles.projectCard}>
                <View style={styles.projFormGroup}>
                  <TextInput
                    editable={isEditing}
                    value={proj.title}
                    onChangeText={(txt) => updateProject(idx, 'title', txt)}
                    placeholder="Project Title"
                    placeholderTextColor={COLORS.textMuted}
                    style={[styles.projTitleInput, !isEditing && styles.disabledProjInput]}
                  />
                </View>

                <View style={styles.projLinksRow}>
                  <TextInput
                    editable={isEditing}
                    value={proj.githubLink || ""}
                    onChangeText={(txt) => updateProject(idx, 'githubLink', txt)}
                    placeholder="GitHub Link"
                    placeholderTextColor={COLORS.textMuted}
                    style={[styles.projLinkInput, !isEditing && styles.disabledProjInput]}
                  />
                  <TextInput
                    editable={isEditing}
                    value={proj.deploymentLink || ""}
                    onChangeText={(txt) => updateProject(idx, 'deploymentLink', txt)}
                    placeholder="Live Link"
                    placeholderTextColor={COLORS.textMuted}
                    style={[styles.projLinkInput, !isEditing && styles.disabledProjInput]}
                  />
                </View>

                <TextInput
                  editable={isEditing}
                  multiline
                  numberOfLines={2}
                  value={proj.description || ""}
                  onChangeText={(txt) => updateProject(idx, 'description', txt)}
                  placeholder="Brief Description..."
                  placeholderTextColor={COLORS.textMuted}
                  style={[styles.projTextarea, !isEditing && styles.disabledProjInput]}
                />

                <TextInput
                  editable={isEditing}
                  multiline
                  numberOfLines={2}
                  value={proj.workflow || ""}
                  onChangeText={(txt) => updateProject(idx, 'workflow', txt)}
                  placeholder="Explain workflow/architecture..."
                  placeholderTextColor={COLORS.textMuted}
                  style={[styles.projTextarea, styles.italicText, !isEditing && styles.disabledProjInput]}
                />

                {isEditing && (
                  <TouchableOpacity onPress={() => removeProject(idx)} style={styles.removeProjBtn}>
                    <Text style={styles.removeProjText}>Remove Project</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {formData.projects?.length === 0 ? (
              <Text style={styles.noProjectsText}>No projects added yet.</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Resume Parser Modal */}
      <Modal
        visible={showResumeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResumeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Summary</Text>
            <Text style={styles.modalSubtitle}>Paste your full resume text below. AI will extract and summarize key details.</Text>

            <TextInput
              multiline
              numberOfLines={8}
              value={rawResume}
              onChangeText={setRawResume}
              placeholder="Paste raw resume here..."
              placeholderTextColor={COLORS.textMuted}
              style={[globalStyles.input, styles.modalTextarea]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancel}
                onPress={() => setShowResumeModal(false)}
                disabled={generating}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirm}
                onPress={handleGenerateSummary}
                disabled={generating || !rawResume.trim()}
              >
                {generating ? (
                  <ActivityIndicator size="small" color={COLORS.bg900} />
                ) : (
                  <Text style={styles.modalConfirmText}>Generate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  headerBtnEdit: {
    backgroundColor: COLORS.bg800,
    borderWidth: 1,
    borderColor: COLORS.bg600,
  },
  headerBtnEditText: {
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    gap: 20,
  },
  notification: {
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    borderColor: COLORS.accent,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  notificationText: {
    color: COLORS.accentLight,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sectionCard: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  disabledInput: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  helpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  experiencePicker: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg900,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    padding: 3,
  },
  expOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  expOptionActive: {
    backgroundColor: COLORS.accent,
  },
  expOptionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  expOptionTextActive: {
    color: COLORS.bg900,
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    borderColor: 'rgba(0, 184, 148, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  skillTagText: {
    color: COLORS.accentLight,
    fontSize: 13,
    fontWeight: '600',
  },
  removeSkillBtn: {
    marginLeft: 6,
    padding: 2,
  },
  removeSkillText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  addSkillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addSkillInput: {
    flex: 1,
    paddingVertical: 8,
  },
  addSkillBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSkillBtnText: {
    color: COLORS.bg900,
    fontWeight: 'bold',
    fontSize: 14,
  },
  resumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resumeAutoBtn: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: 'bold',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addProjBtn: {
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    borderColor: 'rgba(0, 184, 148, 0.3)',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  addProjBtnText: {
    color: COLORS.accentLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  projectsList: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: COLORS.bg900,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  projFormGroup: {
    marginBottom: 10,
  },
  projTitleInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: COLORS.bg600,
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  projLinksRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  projLinkInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: COLORS.bg600,
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  projTextarea: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: COLORS.bg600,
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    height: 50,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  disabledProjInput: {
    opacity: 0.5,
  },
  italicText: {
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  removeProjBtn: {
    alignSelf: 'flex-start',
  },
  removeProjText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  noProjectsText: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: COLORS.bg800,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modalTextarea: {
    height: 180,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    backgroundColor: COLORS.bg900,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: COLORS.bg900,
    fontWeight: 'bold',
  },
});

export default Profile;
