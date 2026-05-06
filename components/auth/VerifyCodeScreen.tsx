import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { SPIRITUAL_COLORS } from '@/constants/SpiritualColors';
import { styles } from './styles/VerifyCodeScreen.styles';
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
