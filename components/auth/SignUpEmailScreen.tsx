import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { SPIRITUAL_COLORS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';
import { twoFactorService } from '@/services/twoFactorService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignUpEmailScreenProps {
  onBack: () => void;
  onCodeSent: (email: string, name: string) => void;
}

export const SignUpEmailScreen: React.FC<SignUpEmailScreenProps> = ({ onBack, onCodeSent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError('Please enter your first and last name.');
      return false;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return false;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return false;
    }
    setError(null);
    return true;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await twoFactorService.sendVerificationCode(email.trim());
      if (result.success) {
        onCodeSent(email.trim().toLowerCase(), name.trim());
      } else {
        setError(result.error || 'Could not send code. Please try again.');
      }
    } catch (_) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.container}>
            <Text style={styles.title}>Sign Up with Email</Text>
            <Text style={styles.subtext}>
              Enter your name and email to receive a 6-digit code to verify your identity. You’ll use this code on the next screen to complete sign-up.
            </Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="First and last name"
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={name}
              onChangeText={(t) => { setName(t); setError(null); }}
              autoCapitalize="words"
              autoComplete="name"
              editable={!isLoading}
            />
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="name@example.com"
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: SPIRITUAL_COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20, paddingTop: 12 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 16, marginBottom: 16 },
  backButtonText: { fontSize: 16, color: SPIRITUAL_COLORS.primary, fontWeight: '500' },
  container: { maxWidth: 400, width: '100%', alignSelf: 'center' },
  title: {
    ...SPIRITUAL_TYPOGRAPHY.spiritualHeading,
    fontSize: 26,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: SPIRITUAL_COLORS.input || SPIRITUAL_COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 8,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
  },
  inputError: { borderColor: SPIRITUAL_COLORS.spiritualRed },
  errorText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.spiritualRed,
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  continueButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
});
