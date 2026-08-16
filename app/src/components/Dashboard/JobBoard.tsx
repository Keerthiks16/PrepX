import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Modal, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import api from '../../store/api';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';

interface Job {
  _id: string;
  company: string;
  role: string;
  status: 'Applied' | 'Task' | 'Interview' | 'Offer' | 'Rejected';
  dateApplied: string;
  notes?: string;
}

const STATUS_COLS: Job['status'][] = ['Applied', 'Task', 'Interview', 'Offer', 'Rejected'];

const JobBoard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Job['status']>('Applied');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // New Job Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<Job['status']>('Applied');

  useEffect(() => { 
    fetchJobs(); 
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/api/jobs');
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    if (!company || !role) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    try {
      const { data } = await api.post('/api/jobs', { company, role, status });
      setJobs([data, ...jobs]);
      setShowAddModal(false);
      setCompany('');
      setRole('');
    } catch (error) {
      console.error("Failed to add job", error);
      Alert.alert('Error', 'Failed to add job application');
    }
  };

  const handleUpdateStatus = async (jobId: string, newStatus: Job['status']) => {
    try {
      // Optimistic update
      setJobs(prevJobs => prevJobs.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
      setShowStatusModal(false);
      await api.put(`/api/jobs/${jobId}`, { status: newStatus });
    } catch (error) {
      console.error("Update failed", error);
      fetchJobs(); // Rollback
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    Alert.alert(
      'Delete Application',
      'Are you sure you want to delete this job application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setJobs(prevJobs => prevJobs.filter(j => j._id !== jobId));
              await api.delete(`/api/jobs/${jobId}`);
            } catch (error) {
              console.error("Delete failed", error);
              fetchJobs();
            }
          }
        }
      ]
    );
  };

  const filteredJobs = jobs.filter(j => j.status === activeTab);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={globalStyles.title}>Job Tracker</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <CustomIcon name="plus" size={16} color={COLORS.bg900} />
          <Text style={styles.addButtonText}>Add Job</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={STATUS_COLS}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const count = jobs.filter(j => j.status === item).length;
            const isActive = activeTab === item;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(item)}
                style={[
                  styles.tabButton,
                  isActive && styles.activeTabButton,
                  isActive && item === 'Offer' && styles.activeOfferTab,
                  isActive && item === 'Rejected' && styles.activeRejectedTab,
                ]}
              >
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{item}</Text>
                <View style={[styles.badge, isActive && styles.activeBadge]}>
                  <Text style={[styles.badgeText, isActive && styles.activeBadgeText]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.tabsScrollContent}
        />
      </View>

      {/* Applications List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[globalStyles.card, styles.jobCard]}>
            <View style={styles.jobInfo}>
              <Text style={styles.companyName}>{item.company}</Text>
              <Text style={styles.jobRole}>{item.role}</Text>
              <Text style={styles.jobDate}>Applied: {new Date(item.dateApplied).toLocaleDateString()}</Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.statusChangeBtn}
                onPress={() => {
                  setSelectedJob(item);
                  setShowStatusModal(true);
                }}
              >
                <Text style={styles.statusBtnText}>Move Status</Text>
                <CustomIcon name="chevron-down" size={10} color={COLORS.accent} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => handleDeleteJob(item._id)}
              >
                <CustomIcon name="trash" size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CustomIcon name="briefcase" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No applications in this category yet.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Add Job Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Application</Text>
            
            <View style={styles.formGroup}>
              <Text style={globalStyles.label}>Company</Text>
              <TextInput
                value={company}
                onChangeText={setCompany}
                style={globalStyles.input}
                placeholder="e.g. Google"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={globalStyles.label}>Role</Text>
              <TextInput
                value={role}
                onChangeText={setRole}
                style={globalStyles.input}
                placeholder="e.g. Software Engineer"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={globalStyles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                {STATUS_COLS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(s)}
                    style={[styles.pickerItem, status === s && styles.pickerItemActive]}
                  >
                    <Text style={[styles.pickerItemText, status === s && styles.pickerItemTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmBtn}
                onPress={handleAddJob}
              >
                <Text style={styles.confirmBtnText}>Add Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Move Status Modal */}
      <Modal
        visible={showStatusModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModalContent}>
            <Text style={styles.modalTitle}>Move Status</Text>
            <Text style={styles.modalSubtitle}>Change stage for {selectedJob?.company}</Text>

            <View style={styles.statusList}>
              {STATUS_COLS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => selectedJob && handleUpdateStatus(selectedJob._id, s)}
                  style={[styles.statusSelectOption, selectedJob?.status === s && styles.statusSelectOptionActive]}
                >
                  <Text style={[styles.statusOptionText, selectedJob?.status === s && styles.statusOptionTextActive]}>
                    {s}
                  </Text>
                  {selectedJob?.status === s && <CustomIcon name="check" size={14} color={COLORS.bg900} />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.cancelBtn, { marginTop: 16 }]}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  addButtonText: {
    color: COLORS.bg900,
    fontWeight: 'bold',
    fontSize: 13,
  },
  tabsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg800,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: COLORS.bg700,
    borderColor: COLORS.accent,
  },
  activeOfferTab: {
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
  },
  activeRejectedTab: {
    borderColor: COLORS.error,
  },
  tabLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.bg900,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: COLORS.accent,
  },
  badgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeBadgeText: {
    color: COLORS.bg900,
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 80,
  },
  jobCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  jobInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  jobRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  jobDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  statusChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg700,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusBtnText: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  statusModalContent: {
    backgroundColor: COLORS.bg800,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    padding: 24,
    width: '90%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  formGroup: {
    gap: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pickerItem: {
    backgroundColor: COLORS.bg900,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickerItemActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  pickerItemText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pickerItemTextActive: {
    color: COLORS.bg900,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.bg900,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: COLORS.bg900,
    fontWeight: 'bold',
  },
  statusList: {
    gap: 10,
  },
  statusSelectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bg900,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statusSelectOptionActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  statusOptionText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  statusOptionTextActive: {
    color: COLORS.bg900,
    fontWeight: 'bold',
  },
});

export default JobBoard;
