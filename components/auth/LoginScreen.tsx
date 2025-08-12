import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS, SPIRITUAL_TYPOGRAPHY } from '../../constants/SpiritualColors';

// Safe gradient helper
const getSafeGradient = (gradientKey: keyof typeof SPIRITUAL_GRADIENTS) => {
  const gradient = SPIRITUAL_GRADIENTS[gradientKey];
  return gradient && Array.isArray(gradient) && gradient.length > 0
    ? gradient
    : SPIRITUAL_GRADIENTS.safe;
};

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, signInWithGoogle, resetPassword, error, clearError, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'Password Mismatch',
          text2: 'Passwords do not match',
        });
        return;
      }

      if (password.length < 6) {
        Toast.show({
          type: 'error',
          text1: 'Weak Password',
          text2: 'Password must be at least 6 characters',
        });
        return;
      }
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      clearError();

      if (isSignUp) {
        await signUp(email.trim(), password, displayName.trim() || undefined);
        Toast.show({
          type: 'success',
          text1: 'Account Created',
          text2: 'Welcome to our spiritual community!',
        });
      } else {
        await signIn(email.trim(), password);
        Toast.show({
          type: 'success',
          text1: 'Welcome Back',
          text2: 'You have successfully signed in',
        });
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: isSignUp ? 'Sign Up Failed' : 'Sign In Failed',
        text2: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      clearError();
      await signInWithGoogle();
      Toast.show({
        type: 'success',
        text1: 'Welcome',
        text2: 'Signed in with Google successfully',
      });
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Google Sign In Failed',
        text2: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Please enter your email address first',
      });
      return;
    }

    try {
      await resetPassword(email.trim());
      Toast.show({
        type: 'success',
        text1: 'Reset Email Sent',
        text2: 'Check your email for password reset instructions',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearError();
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={getSafeGradient('peaceful')} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="flower" size={60} color={SPIRITUAL_COLORS.primary} />
              </View>
              <Text style={[SPIRITUAL_TYPOGRAPHY.title, styles.title]}>
                {isSignUp ? 'Join Our Community' : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp
                  ? 'Begin your spiritual journey with us'
                  : 'Continue your spiritual journey'
                }
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color={SPIRITUAL_COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name (Optional)"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    textContentType="name"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color={SPIRITUAL_COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color={SPIRITUAL_COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color={SPIRITUAL_COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color={SPIRITUAL_COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color={SPIRITUAL_COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={SPIRITUAL_COLORS.destructive} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
                ) : (
                  <>
                    <Ionicons
                      name={isSignUp ? 'person-add' : 'log-in'}
                      size={20}
                      color={SPIRITUAL_COLORS.primaryForeground}
                    />
                    <Text style={styles.submitButtonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Forgot Password (Sign In only) */}
              {!isSignUp && (
                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color={SPIRITUAL_COLORS.primary} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Toggle Mode */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.toggleLink}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  title: {
    color: SPIRITUAL_COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...SPIRITUAL_SHADOWS.card,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
  },
  eyeIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: SPIRITUAL_COLORS.destructive,
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...SPIRITUAL_SHADOWS.button,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: SPIRITUAL_COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: SPIRITUAL_COLORS.border,
  },
  dividerText: {
    color: SPIRITUAL_COLORS.textMuted,
    fontSize: 14,
    paddingHorizontal: 16,
  },
  googleButton: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    ...SPIRITUAL_SHADOWS.card,
  },
  googleButtonText: {
    color: SPIRITUAL_COLORS.foreground,
    fontSize: 16,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  toggleText: {
    color: SPIRITUAL_COLORS.textMuted,
    fontSize: 14,
  },
  toggleLink: {
    color: SPIRITUAL_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});