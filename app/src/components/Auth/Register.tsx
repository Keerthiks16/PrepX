import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../store/api';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';

interface RegisterProps {
  onSwitchToLogin?: () => void;
  onSwitch?: () => void;
  onSuccess?: () => void;
}

const Register = ({ onSwitchToLogin, onSwitch, onSuccess }: RegisterProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'name' | 'email' | 'password' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      login(data);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <CustomIcon name="cpu" size={26} color={COLORS.accentLight} />
          </View>
          <Text style={styles.brandTitle}>
            Prep<Text style={styles.brandAccent}>X</Text>
          </Text>
          <View style={styles.taglineBadge}>
            <CustomIcon name="sparkles" size={11} color={COLORS.accent} />
            <Text style={styles.taglineText}>AI CAREER PLATFORM</Text>
          </View>
        </View>

        {/* Main Form Card */}
        <View style={[globalStyles.card, styles.card]}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join PrepX to start preparing with AI-powered tools</Text>
          
          {/* Feature Badges */}
          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>🎯 GD Simulator</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>📄 Smart Resume</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <CustomIcon name="info" size={16} color={COLORS.error} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name Input */}
          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Full Name</Text>
            <View style={[
              styles.inputWrapper, 
              focusedInput === 'name' && styles.inputWrapperFocused
            ]}>
              <CustomIcon 
                name="user" 
                size={18} 
                color={focusedInput === 'name' ? COLORS.accent : COLORS.textMuted} 
                style={styles.inputIcon} 
              />
              <TextInput
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                style={styles.textInput}
                placeholder="John Doe"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Email Address</Text>
            <View style={[
              styles.inputWrapper, 
              focusedInput === 'email' && styles.inputWrapperFocused
            ]}>
              <CustomIcon 
                name="mail" 
                size={18} 
                color={focusedInput === 'email' ? COLORS.accent : COLORS.textMuted} 
                style={styles.inputIcon} 
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.formGroup}>
            <Text style={globalStyles.label}>Password</Text>
            <View style={[
              styles.inputWrapper, 
              focusedInput === 'password' && styles.inputWrapperFocused
            ]}>
              <CustomIcon 
                name="lock" 
                size={18} 
                color={focusedInput === 'password' ? COLORS.accent : COLORS.textMuted} 
                style={styles.inputIcon} 
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                style={styles.textInput}
                placeholder="Create a password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <CustomIcon 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={18} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color={COLORS.bg900} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Creating Account...</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.submitBtnText}>Sign Up</Text>
                <Text style={styles.btnArrow}>→</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Switch to Login */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => (onSwitchToLogin ? onSwitchToLogin() : onSwitch?.())}>
              <Text style={styles.switchLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Security Badge */}
        <View style={styles.footerBadge}>
          <CustomIcon name="shield" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <Text style={styles.footerBadgeText}>Encrypted & Secure AI Environment</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.bg900,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.bg800,
    borderColor: COLORS.accent + '40',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: COLORS.accent,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentGlow,
    borderColor: COLORS.accent + '35',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 6,
  },
  taglineText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: COLORS.bg800,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  featurePill: {
    backgroundColor: COLORS.bg700,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featurePillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: COLORS.bg600,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(0, 184, 148, 0.05)',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorGlow,
    borderColor: COLORS.error + '60',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: COLORS.bg900,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  btnArrow: {
    color: COLORS.bg900,
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  switchText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  switchLink: {
    color: COLORS.accentLight,
    fontWeight: '800',
    fontSize: 14,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerBadgeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Register;

