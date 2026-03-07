import React, { useState, useEffect } from 'react';
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
import { SPIRITUAL_COLORS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';
import { twoFactorService } from '@/services/twoFactorService';
import { useAuth } from '@/contexts/AuthContext';

const RETRY_COOLDOWN = twoFactorService.RETRY_COOLDOWN_SECONDS;
const CODE_LENGTH = twoFactorService.CODE_LENGTH;

interface VerifyCodeScreenProps {
  email: string;
  name: string;
  onBack: () => void;
}

export const VerifyCodeScreen: React.FC<VerifyCodeScreenProps> = ({ email, name, onBack }) => {
  const { completeSignUp, isLoading: authLoading } = useAuth();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrySecondsLeft, setRetrySecondsLeft] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setRetrySecondsLeft(RETRY_COOLDOWN);
  }, []);

  useEffect(() => {
    if (retrySecondsLeft <= 0) return;
    const t = setInterval(() => setRetrySecondsLeft((s) => (s <= 0 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [retrySecondsLeft]);

  const handleVerify = async () => {
    const digits = code.replace(/\D/g, '');
    if (digits.length !== CODE_LENGTH) {
      setError(`Please enter the ${CODE_LENGTH}-digit code from your email.`);
      return;
    }
    setError(null);
    setIsVerifying(true);
    try {
      const result = await twoFactorService.verifyCode(email, digits);
      if (result.success) {
        await completeSignUp(email, name);
      } else {
        setError(result.error || 'Invalid or expired code.');
      }
    } catch (_) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = async () => {
    if (retrySecondsLeft > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      const result = await twoFactorService.sendVerificationCode(email);
      if (result.success) {
        setRetrySecondsLeft(RETRY_COOLDOWN);
      } else {
        setError(result.error || 'Could not resend code.');
      }
    } catch (_) {
      setError('Could not resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const loading = isVerifying || authLoading;

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
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtext}>
              We sent a 6-digit verification code to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
              {'\n'}Enter it below to verify your identity and sign in.
            </Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="000000"
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={code}
              onChangeText={(t) => { setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH)); setError(null); }}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              editable={!loading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & sign in</Text>
              )}
            </TouchableOpacity>
            {retrySecondsLeft > 0 ? (
              <Text style={styles.retryHint}>
                Resend code available in {retrySecondsLeft}s
              </Text>
            ) : (
              <TouchableOpacity
                style={[styles.retryButton, isResending && styles.buttonDisabled]}
                onPress={handleRetry}
                disabled={isResending}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>
                  {isResending ? 'Sending…' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            )}
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
  emailHighlight: { fontWeight: '600', color: SPIRITUAL_COLORS.foreground },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: SPIRITUAL_COLORS.input || SPIRITUAL_COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 8,
    fontSize: 24,
    letterSpacing: 8,
    color: SPIRITUAL_COLORS.foreground,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    textAlign: 'center',
  },
  inputError: { borderColor: SPIRITUAL_COLORS.spiritualRed },
  errorText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.spiritualRed,
    marginBottom: 12,
  },
  verifyButton: {
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
  verifyButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  retryHint: {
    marginTop: 24,
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 15,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '500',
  },
});
