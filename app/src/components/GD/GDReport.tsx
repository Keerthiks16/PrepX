import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';

interface GDReportProps {
  data: {
    rating: number;
    summary: string;
    speakerType: 'excellent' | 'neutral' | 'aggressive' | 'silent';
    speakerTypeDescription?: string;
    suggestions: string[];
    redFlags: string[];
  };
  onRestart: () => void;
}

const GDReport = ({ data, onRestart }: GDReportProps) => {
  const getSpeakerTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'excellent': return COLORS.success;
      case 'neutral': return COLORS.info;
      case 'aggressive': return COLORS.error;
      case 'silent': return COLORS.textSecondary;
      default: return COLORS.textPrimary;
    }
  };

  const speakerColor = getSpeakerTypeColor(data.speakerType);

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>GD Performance Report</Text>
        <Text style={globalStyles.subtitle}>Analysis completed by AI Evaluator</Text>
      </View>

      {/* Overview Cards */}
      <View style={styles.overviewRow}>
        {/* Score Card */}
        <View style={[globalStyles.card, styles.scoreCard]}>
          <View style={[styles.circleMeter, { borderColor: COLORS.accent }]}>
            <Text style={styles.scoreValue}>{data.rating}%</Text>
          </View>
          <Text style={styles.scoreLabel}>Overall Score</Text>
        </View>

        {/* Persona Card */}
        <View style={[globalStyles.card, styles.personaCard, { borderColor: speakerColor + '30', backgroundColor: speakerColor + '08' }]}>
          <View style={styles.personaHeader}>
            <CustomIcon name="user" size={24} color={speakerColor} />
            <View>
              <Text style={styles.personaSubText}>Speaker Persona</Text>
              <Text style={[styles.personaTitle, { color: speakerColor }]}>
                {data.speakerType?.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.personaDesc}>
            {data.speakerTypeDescription || `You performed as a ${data.speakerType} participant during the discussion.`}
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={[globalStyles.card, styles.sectionCard]}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.summaryText}>{data.summary}</Text>
      </View>

      {/* Suggestions & Red Flags */}
      <View style={styles.detailsContainer}>
        {/* Suggestions */}
        <View style={[globalStyles.card, styles.sectionCard]}>
          <Text style={styles.sectionTitle}>Key Suggestions</Text>
          <View style={styles.pointsList}>
            {data.suggestions?.map((s, i) => (
              <View key={i} style={styles.pointRow}>
                <View style={[styles.pointDot, { backgroundColor: COLORS.accent }]} />
                <Text style={styles.pointText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Red Flags */}
        <View style={[globalStyles.card, styles.sectionCard]}>
          <Text style={[styles.sectionTitle, { color: COLORS.error }]}>Red Flags</Text>
          <View style={styles.pointsList}>
            {data.redFlags && data.redFlags.length > 0 ? (
              data.redFlags.map((f, i) => (
                <View key={i} style={styles.redFlagRow}>
                  <Text style={styles.redFlagIcon}>⚠️ </Text>
                  <Text style={styles.redFlagText}>{f}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noRedFlags}>
                <Text style={styles.noRedFlagsText}>No Red Flags Detected! ✦</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Restart Button */}
      <TouchableOpacity
        onPress={onRestart}
        style={[globalStyles.accentButton, styles.restartBtn]}
      >
        <Text style={globalStyles.accentButtonText}>Try Another Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 80,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  overviewRow: {
    gap: 16,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 20,
  },
  circleMeter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  personaCard: {
    padding: 16,
    borderWidth: 1,
  },
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  personaSubText: {
    color: COLORS.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  personaTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  personaDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  summaryText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    backgroundColor: COLORS.bg900,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  detailsContainer: {
    gap: 16,
  },
  pointsList: {
    gap: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  pointText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  redFlagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.errorGlow,
    borderColor: COLORS.error + '30',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  redFlagIcon: {
    fontSize: 12,
  },
  redFlagText: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  noRedFlags: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  noRedFlagsText: {
    color: COLORS.accentLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  restartBtn: {
    marginTop: 12,
  },
});

export default GDReport;
