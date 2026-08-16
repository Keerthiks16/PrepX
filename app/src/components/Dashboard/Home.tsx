import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';

interface HomeProps {
  onNavigate: (view: 'home' | 'profile' | 'jobs' | 'networking' | 'resume' | 'cover-letter' | 'interview' | 'gd') => void;
}

const Home = ({ onNavigate }: HomeProps) => {
  const features = [
    {
      id: 'interview',
      title: 'AI Interview Coach',
      tagline: 'Master your interview skills with real-time AI guidance.',
      description: 'Practice with our state-of-the-art AI interviewer. Get instant feedback on your tone and answer quality. Prepare for specific roles and scenarios with personalized coaching sessions.',
      icon: 'brain' as const,
      color: 'rgba(0, 184, 148, 0.05)',
      borderColor: 'rgba(0, 184, 148, 0.2)',
      bulletColor: COLORS.accent,
      buttonText: 'Try AI Coach',
      bullets: ['Real-time Feedback', 'Role-Specific Prep', 'Unlimited Sessions']
    },
    {
      id: 'gd',
      title: 'GD Preparation',
      tagline: 'Dominate group discussions with AI personas.',
      description: 'Practice multi-bot Group Discussions with diverse AI personas. Learn how to handle aggressive speakers, silent partners, and lead the conversation effectively with real-time evaluation.',
      icon: 'users' as const,
      color: 'rgba(52, 152, 219, 0.05)',
      borderColor: 'rgba(52, 152, 219, 0.2)',
      bulletColor: '#3498db',
      buttonText: 'Practice GD',
      bullets: ['Multi-Persona Bots', 'Custom Topics', 'Red Flag Detection']
    },
    {
      id: 'resume',
      title: 'Resume Architect',
      tagline: 'Build ATS-optimized resumes that stand out.',
      description: 'Generate professional LaTeX resumes tailored specifically to your target job descriptions. Our AI ensures your skills and experience are highlighted to pass through automated screening systems.',
      icon: 'file-text' as const,
      color: 'rgba(155, 89, 182, 0.05)',
      borderColor: 'rgba(155, 89, 182, 0.2)',
      bulletColor: '#9b59b6',
      buttonText: 'Design Resume',
      bullets: ['ATS Optimization', 'LaTeX Export', 'Job Tailoring']
    },
    {
      id: 'networking',
      title: 'Networking AI',
      tagline: 'Make every connection count with tailored outreach.',
      description: 'Craft perfect professional outreach messages in seconds. Whether it\'s LinkedIn or email, our AI helps you connect with recruiters and industry professionals using proven communication strategies.',
      icon: 'users' as const,
      color: 'rgba(46, 204, 113, 0.05)',
      borderColor: 'rgba(46, 204, 113, 0.2)',
      bulletColor: '#2ecc71',
      buttonText: 'Outreach AI',
      bullets: ['Proven Templates', 'Smart Personalization', 'Multi-platform support']
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter Pro',
      tagline: 'Compelling letters that open doors to opportunities.',
      description: 'Generate high-impact cover letters and professional emails effortlessly. Scale your application process without sacrificing quality or personalization in your communications.',
      icon: 'send' as const,
      color: 'rgba(230, 126, 34, 0.05)',
      borderColor: 'rgba(230, 126, 34, 0.2)',
      bulletColor: '#e67e22',
      buttonText: 'Write Letter',
      bullets: ['Fast Generation', 'Persuasive Writing', 'Professional Formatting']
    }
  ];

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.badge}>
          <CustomIcon name="sparkles" size={14} color={COLORS.accentLight} style={styles.badgeIcon} />
          <Text style={styles.badgeText}>Powered by Advanced AI</Text>
        </View>
        
        <Text style={styles.heroTitle}>
          Elevate Your {'\n'}
          <Text style={styles.heroTitleAccent}>Career Journey</Text>
        </Text>
        
        <Text style={styles.heroSubtitle}>
          Personalized AI-driven tools to help you land your dream job. From initial outreach to the final interview.
        </Text>

        <TouchableOpacity 
          style={globalStyles.accentButton}
          onPress={() => onNavigate('interview')}
        >
          <Text style={globalStyles.accentButtonText}>Start Your First Interview</Text>
        </TouchableOpacity>
      </View>

      {/* Feature Cards */}
      <View style={styles.featuresList}>
        {features.map((feature) => (
          <View 
            key={feature.id} 
            style={[
              globalStyles.card, 
              styles.featureCard, 
              { backgroundColor: feature.color, borderColor: feature.borderColor }
            ]}
          >
            <View style={styles.featureHeader}>
              <CustomIcon name={feature.icon} size={22} color={COLORS.accentLight} />
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </View>

            <Text style={styles.featureTagline}>{feature.tagline}</Text>
            <Text style={styles.featureDesc}>{feature.description}</Text>

            <View style={styles.bulletsContainer}>
              {feature.bullets.map((bullet, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: feature.bulletColor }]} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={[globalStyles.secondaryButton, { borderColor: feature.borderColor }]}
              onPress={() => onNavigate(feature.id as any)}
            >
              <Text style={globalStyles.secondaryButtonText}>{feature.buttonText}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Why candidates trust PrepX</Text>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>10x</Text>
          <Text style={styles.statLabel}>Faster Preparation</Text>
          <Text style={styles.statDesc}>Cut down weeks of manual practice into days of focused AI sessions.</Text>
        </View>

        <View style={[styles.statItem, styles.statBorder]}>
          <Text style={styles.statValue}>75%</Text>
          <Text style={styles.statLabel}>ATS Compatibility</Text>
          <Text style={styles.statDesc}>Resumes designed to pass through the toughest recruiter screening tools.</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>24/7</Text>
          <Text style={styles.statLabel}>AI Availability</Text>
          <Text style={styles.statDesc}>Your personal career coach is always ready, whenever you are.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.2)',
    marginBottom: 20,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: COLORS.accent,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  featuresList: {
    paddingHorizontal: 16,
    gap: 24,
  },
  featureCard: {
    padding: 20,
    borderWidth: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  featureTagline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 26,
  },
  featureDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  bulletsContainer: {
    marginBottom: 20,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  bulletText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  statsSection: {
    marginTop: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  statItem: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statValue: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.accentLight,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  statDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default Home;
