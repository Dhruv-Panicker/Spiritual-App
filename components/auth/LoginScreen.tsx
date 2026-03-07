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
  SafeAreaView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

interface LoginScreenProps {
  /** When provided, show a link to go to sign-up flow */
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>Spiritual App</Text>
              <Text style={styles.subtitle}>Welcome to Your Spiritual Journey</Text>

              <View style={styles.form}>
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
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
              </TouchableOpacity>
            </View>

            {onGoToSignUp ? (
              <TouchableOpacity style={styles.signUpLink} onPress={onGoToSignUp} activeOpacity={0.7}>
                <Text style={styles.signUpLinkText}>Don't have an account? Sign up</Text>
              </TouchableOpacity>
            ) : null}

              <Text style={styles.infoText}>
                Sign in with your email.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    ...SPIRITUAL_TYPOGRAPHY.spiritualHeading,
    fontSize: 36,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: SPIRITUAL_COLORS.input || SPIRITUAL_COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
  },
  inputError: {
    borderColor: SPIRITUAL_COLORS.spiritualRed,
  },
  errorText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.spiritualRed,
    marginBottom: 12,
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
  goToSignUpButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    backgroundColor: SPIRITUAL_COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  signUpLink: {
    marginTop: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  signUpLinkText: {
    fontSize: 15,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '500',
  },
  infoText: {
    marginTop: 30,
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
});

