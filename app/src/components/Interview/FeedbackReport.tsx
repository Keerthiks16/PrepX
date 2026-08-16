import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';

interface FeedbackData {
  rating: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

interface FeedbackReportProps {
  data: FeedbackData;
  onRestart: () => void;
  onCoaching?: () => void;
}

const FeedbackReport = ({ data, onRestart, onCoaching }: FeedbackReportProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return COLORS.success;
    if (rating >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 90) return 'Excellent';
    if (rating >= 80) return 'Very Good';
    if (rating >= 60) return 'Good';
    if (rating >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const ratingColor = getRatingColor(data.rating);

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Interview Analysis</Text>
        <Text style={globalStyles.subtitle}>Here is how you performed in your session</Text>
      </View>

      {/* Score Card */}
      <View style={[globalStyles.card, styles.scoreCard]}>
        <View style={styles.scoreBar} />
        
        <View style={[styles.circleMeter, { borderColor: ratingColor }]}>
          <Text style={[styles.scoreValue, { color: ratingColor }]}>{data.rating}</Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </View>

        <Text style={[styles.ratingLabel, { color: ratingColor }]}>
          {getRatingLabel(data.rating)}
        </Text>
        <Text style={styles.summaryText}>"{data.summary}"</Text>
      </View>

      {/* Details Lists */}
      <View style={styles.detailsGrid}>
        {/* Strengths Card */}
        <View style={[globalStyles.card, styles.detailCard, styles.strengthsCard]}>
          <Text style={styles.detailTitle}>
            <Text style={{ color: COLORS.success }}>✓ </Text>Key Strengths
          </Text>
          <View style={styles.pointsList}>
            {data.strengths?.map((point, i) => (
              <View key={i} style={styles.pointRow}>
                <View style={[styles.pointDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weaknesses Card */}
        <View style={[globalStyles.card, styles.detailCard, styles.weaknessesCard]}>
          <Text style={styles.detailTitle}>
            <Text style={{ color: COLORS.error }}>× </Text>Areas for Improvement
          </Text>
          <View style={styles.pointsList}>
            {data.weaknesses?.map((point, i) => (
              <View key={i} style={styles.pointRow}>
                <View style={[styles.pointDot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Improvements Card */}
        <View style={[globalStyles.card, styles.detailCard, styles.improvementsCard]}>
          <Text style={styles.detailTitle}>
            <Text style={{ color: COLORS.info }}>✏ </Text>Recommended Learning
          </Text>
          <View style={styles.improvementsGrid}>
            {data.improvements?.map((point, i) => (
              <View key={i} style={styles.improvementItem}>
                <Text style={styles.improvementText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={globalStyles.accentButton}
          onPress={onRestart}
        >
          <Text style={globalStyles.accentButtonText}>Start New Interview</Text>
        </TouchableOpacity>

        {onCoaching ? (
          <TouchableOpacity 
            style={styles.coachingBtn}
            onPress={onCoaching}
          >
            <Text style={styles.coachingBtnText}>Practice Project Pitch</Text>
          </TouchableOpacity>
        ) : null}
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
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  scoreBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.accent,
  },
  circleMeter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreMax: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  ratingLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  detailsGrid: {
    gap: 16,
  },
  detailCard: {
    padding: 16,
  },
  strengthsCard: {
    borderColor: 'rgba(46, 204, 113, 0.2)',
  },
  weaknessesCard: {
    borderColor: 'rgba(231, 76, 60, 0.2)',
  },
  improvementsCard: {
    borderColor: 'rgba(52, 152, 219, 0.2)',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
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
  improvementsGrid: {
    gap: 8,
  },
  improvementItem: {
    backgroundColor: COLORS.bg900,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.bg600,
  },
  improvementText: {
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  actionsContainer: {
    marginTop: 12,
    gap: 12,
  },
  coachingBtn: {
    backgroundColor: COLORS.bg700,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coachingBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FeedbackReport;
