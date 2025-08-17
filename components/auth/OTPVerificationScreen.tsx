
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '../../constants/SpiritualColors';
import { emailVerificationService } from '../../services/emailService';

interface OTPVerificationScreenProps {
  email: string;
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
}

export const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  email,
  onVerificationSuccess,
  onBackToLogin,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start countdown timer
    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);
    
    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      clearInterval(timer);
      pulseAnimation.stop();
    };
  }, []);

  const updateRemainingTime = () => {
    const remaining = emailVerificationService.getRemainingTime(email);
    setRemainingTime(remaining);
    setCanResend(remaining <= 0);
  };

  const handleOTPChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (value && newOtp.every(digit => digit !== '')) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');
    
    if (otpToVerify.length !== 6) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter all 6 digits.',
      });
      return;
    }

    setIsVerifying(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const isValid = emailVerificationService.verifyOTP(email, otpToVerify);
      
      if (isValid) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: 'success',
          text1: 'Email Verified!',
          text2: 'Your email has been successfully verified.',
        });
        onVerificationSuccess();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP',
          text2: 'Please check your code and try again.',
        });
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: 'Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const success = await emailVerificationService.sendOTP(email);
      
      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: 'success',
          text1: 'OTP Resent',
          text2: 'A new verification code has been sent to your email.',
        });
        setOtp(['', '', '', '', '', '']);
        setCanResend(false);
        updateRemainingTime();
      } else {
        throw new Error('Failed to resend OTP');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Resend Failed',
        text2: 'Please try again later.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient colors={SPIRITUAL_GRADIENTS.peace} style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.headerContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to
          </Text>
          <Text style={styles.email}>{email}</Text>
        </Animated.View>

        <View style={styles.otpContainer}>
          <View style={styles.otpInputContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                ]}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isVerifying || otp.join('').length !== 6) && styles.buttonDisabled
            ]}
            onPress={() => handleVerifyOTP()}
            disabled={isVerifying || otp.join('').length !== 6}
          >
            {isVerifying ? (
              <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.timerText}>
              Resend code in {formatTime(remainingTime)}
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOTP}
              disabled={isResending}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={SPIRITUAL_COLORS.primary} />
              ) : (
                <Text style={styles.resendButtonText}>Resend Code</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToLogin}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primary,
    textAlign: 'center',
  },
  otpContainer: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    ...SPIRITUAL_SHADOWS.divine,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    backgroundColor: SPIRITUAL_COLORS.input,
  },
  otpInputFilled: {
    borderColor: SPIRITUAL_COLORS.primary,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  verifyButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    fontWeight: '500',
  },
});
