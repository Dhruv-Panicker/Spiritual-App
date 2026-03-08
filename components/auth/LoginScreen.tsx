import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';

interface LoginScreenProps {
  onGoToSignUp?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onGoToSignUp }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    try {
      await login(trimmed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message === 'UNVERIFIED_USER' ? 'UNVERIFIED_USER' : message);
      console.error('Login error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={SPIRITUAL_GRADIENTS.peace} style={styles.gradient}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title – match Welcome */}
            <View style={styles.titleBlock}>
              <Text style={styles.titleLine1}>Sri Sidheshwar</Text>
              <Text style={styles.titleLine2}>SiddhGuru</Text>
            </View>

            {/* Login panel – same style as Welcome bottom panel */}
            <View style={styles.panel}>
              <Text style={styles.panelLabel}>Log in</Text>

              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Email"
                placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(null); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {error === 'UNVERIFIED_USER'
                      ? 'You are an unverified user and have not signed up yet. Please sign up to continue.'
                      : error}
                  </Text>
                  {onGoToSignUp && error === 'UNVERIFIED_USER' ? (
                    <TouchableOpacity
                      style={styles.goToSignUpButton}
                      onPress={onGoToSignUp}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.goToSignUpButtonText}>Go to Sign up</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[SPIRITUAL_COLORS.primary, SPIRITUAL_COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
                  ) : (
                    <Text style={styles.loginButtonText}>Log in</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {onGoToSignUp ? (
                <TouchableOpacity
                  style={styles.signUpLink}
                  onPress={onGoToSignUp}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signUpLinkText}>
                    Don't have an account? <Text style={styles.signUpLinkBold}>Sign up</Text>
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.footerTagline}>
              Sri SiddhGuru · Vedic Wisdom · Ancient Path
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 88,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  titleLine1: {
    fontSize: 11,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    color: SPIRITUAL_COLORS.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleLine2: {
    fontSize: 34,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
    letterSpacing: 0.5,
    lineHeight: 40,
  },
  panel: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(193,127,60,0.15)',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  panelLabel: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
  },
  inputError: {
    borderColor: SPIRITUAL_COLORS.spiritualRed,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FDE8E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.spiritualRed,
  },
  errorText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.spiritualRed,
    marginBottom: 12,
  },
  goToSignUpButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  goToSignUpButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 15,
    fontWeight: '600',
  },
  loginButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#8b4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  loginButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  signUpLinkText: {
    color: SPIRITUAL_COLORS.secondary,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  signUpLinkBold: {
    fontWeight: '700',
  },
  footerTagline: {
    fontSize: 10,
    color: 'rgba(139,69,19,0.5)',
    letterSpacing: 0.5,
    marginTop: 24,
    textAlign: 'center',
  },
});
