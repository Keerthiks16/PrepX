import { StyleSheet } from 'react-native';

export const COLORS = {
  bg900: '#0b0f19',     // Deepest dark
  bg800: '#111827',     // Card dark
  bg700: '#1f2937',     // Light card dark
  bg600: '#374151',     // Border dark
  
  accent: '#00b894',    // Main emerald teal
  accentLight: '#55efc4',
  accentDark: '#00cec9',
  accentGlow: 'rgba(0, 184, 148, 0.2)',
  
  textPrimary: '#f3f4f6',   // Bright text
  textSecondary: '#9ca3af', // Gray text
  textMuted: '#6b7280',     // Darker gray
  
  error: '#ff7675',         // Red
  errorGlow: 'rgba(255, 118, 117, 0.1)',
  success: '#2ecc71',       // Green
  info: '#3498db',          // Blue
  infoGlow: 'rgba(52, 152, 219, 0.15)',
  warning: '#f1c40f',        // Yellow
};

export const FONTS = {
  bold: 'System',
  medium: 'System',
  regular: 'System',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg900,
    marginVertical: 50,
  },
  card: {
    backgroundColor: COLORS.bg800,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardGlow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  accentButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  accentButtonText: {
    color: COLORS.bg900,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: COLORS.bg700,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: COLORS.bg600,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  }
});
