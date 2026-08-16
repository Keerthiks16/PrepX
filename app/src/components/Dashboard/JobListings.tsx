import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView
} from 'react-native';
import api from '../../store/api';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobListing {
  _id: string;
  externalId: string;
  source: string;
  title: string;
  company: string;
  location: string;
  summary: string;
  applyUrl: string;
  postedAt: string;
  salary: string;
  employmentType: string;
}

interface ListingsResponse {
  listings: JobListing[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SOURCE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  jsearch:     { label: 'JSearch',     color: COLORS.info,    bg: 'rgba(56, 189, 248, 0.1)' },
  adzuna:      { label: 'Adzuna',      color: COLORS.warning, bg: 'rgba(251, 191, 36, 0.1)' },
  internshala: { label: 'Internshala', color: COLORS.accent,  bg: 'rgba(16, 185, 129, 0.1)' },
  naukri:      { label: 'Naukri',      color: '#60A5FA',      bg: 'rgba(96, 165, 250, 0.1)' },
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const JobListings = () => {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('');

  // Debounced
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocation(location), 500);
    return () => clearTimeout(t);
  }, [location]);

  const fetchListings = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pg), limit: '10' };
      if (debouncedSearch)   params.q        = debouncedSearch;
      if (debouncedLocation) params.location = debouncedLocation;
      if (source)            params.source   = source;

      const { data } = await api.get<ListingsResponse>('/api/job-listings', { params });
      
      // If page is 1, replace listings, otherwise append
      if (pg === 1) {
        setListings(data.listings);
      } else {
        setListings(prev => [...prev, ...data.listings]);
      }
      
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch job listings:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, debouncedLocation, source]);

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      fetchListings(page + 1);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const { data } = await api.post('/api/job-listings/sync');
      setSyncMsg(`✓ ${data.stats?.inserted ?? 0} new`);
      fetchListings(1);
    } catch (err: any) {
      setSyncMsg(`⚠ Failed`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 5000);
    }
  };

  const handleSave = async (id: string) => {
    setSavingIds(prev => new Set(prev).add(id));
    try {
      await api.post(`/api/job-listings/${id}/save`);
      setSavedIds(prev => new Set(prev).add(id));
      Alert.alert("Success", "Job saved to your tracker!");
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not save job');
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const openLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open URL"));
    }
  };

  const renderJobCard = ({ item }: { item: JobListing }) => {
    const src = SOURCE_LABELS[item.source] ?? { label: item.source, color: COLORS.textSecondary, bg: COLORS.bg700 };
    const isSaved = savedIds.has(item._id);
    const isSaving = savingIds.has(item._id);

    return (
      <View style={[globalStyles.card, styles.jobCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.companyText}>{item.company}</Text>
          </View>
          <View style={[styles.sourceBadge, { backgroundColor: src.bg }]}>
            <Text style={[styles.sourceText, { color: src.color }]}>{src.label}</Text>
          </View>
        </View>

        <View style={styles.metaContainer}>
          {item.location ? (
            <View style={styles.metaRow}>
              <CustomIcon name="map-pin" size={12} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          ) : null}
          {item.salary ? (
            <View style={styles.metaRow}>
              <CustomIcon name="dollar-sign" size={12} color={COLORS.accent} />
              <Text style={[styles.metaText, { color: COLORS.accent }]}>{item.salary}</Text>
            </View>
          ) : null}
          {item.postedAt ? (
            <Text style={styles.timeText}>{timeAgo(item.postedAt)}</Text>
          ) : null}
        </View>

        {item.summary ? (
          <Text style={styles.summaryText} numberOfLines={3}>
            {item.summary}
          </Text>
        ) : null}

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.applyBtn} 
            onPress={() => openLink(item.applyUrl)}
          >
            <Text style={styles.applyBtnText}>Apply →</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.saveBtn,
              isSaved && styles.saveBtnSuccess,
              isSaving && styles.saveBtnLoading
            ]} 
            onPress={() => handleSave(item._id)}
            disabled={isSaved || isSaving}
          >
            <Text style={[
              styles.saveBtnText,
              isSaved && styles.saveBtnTextSuccess
            ]}>
              {isSaved ? '✓ Saved' : isSaving ? 'Saving...' : 'Save Job'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={globalStyles.title}>Discover Jobs</Text>
          <Text style={styles.subtitle}>
            {total > 0 ? `${total} jobs found` : 'Live listings'}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          {syncMsg ? (
            <Text style={styles.syncMsg}>{syncMsg}</Text>
          ) : null}
          <TouchableOpacity 
            style={styles.syncBtn} 
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={COLORS.bg900} />
            ) : (
              <>
                <CustomIcon name="refresh-cw" size={14} color={COLORS.bg900} />
                <Text style={styles.syncBtnText}>Sync</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <CustomIcon name="search" size={16} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search title..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={styles.searchInputContainer}>
            <CustomIcon name="map-pin" size={16} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Location..."
              placeholderTextColor={COLORS.textMuted}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sourceScroll} contentContainerStyle={styles.sourceList}>
          <TouchableOpacity
            style={[styles.sourceChip, source === '' && styles.sourceChipActive]}
            onPress={() => setSource('')}
          >
            <Text style={[styles.sourceChipText, source === '' && styles.sourceChipTextActive]}>All</Text>
          </TouchableOpacity>
          {Object.entries(SOURCE_LABELS).map(([key, info]) => (
            <TouchableOpacity
              key={key}
              style={[styles.sourceChip, source === key && styles.sourceChipActive]}
              onPress={() => setSource(key)}
            >
              <Text style={[styles.sourceChipText, source === key && styles.sourceChipTextActive]}>{info.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading && page === 1 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.centerContainer}>
          <CustomIcon name="briefcase" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No jobs found.</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item, idx) => item._id + idx}
          renderItem={renderJobCard}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 1 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.accent} />
              </View>
            ) : null
          }
        />
      )}
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
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncMsg: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  syncBtnText: {
    color: COLORS.bg900,
    fontWeight: 'bold',
    fontSize: 12,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg600,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg800,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  sourceScroll: {
    flexGrow: 0,
  },
  sourceList: {
    gap: 8,
    paddingRight: 20,
  },
  sourceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.bg800,
    borderWidth: 1,
    borderColor: COLORS.bg600,
  },
  sourceChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  sourceChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sourceChipTextActive: {
    color: COLORS.bg900,
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 80,
  },
  jobCard: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  companyText: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sourceText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginLeft: 'auto',
  },
  summaryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  applyBtnText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 13,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.bg700,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  saveBtnLoading: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  saveBtnTextSuccess: {
    color: COLORS.accent,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  }
});

export default JobListings;
