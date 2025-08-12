
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../../contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '../../constants/SpiritualColors';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, loginWithGoogle, isLoading } = useAuth();
  
  // Animation references
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Sacred pulse animation for Om symbol
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      await login(email, password);
      Toast.show({
        type: 'success',
        text1: 'Welcome',
        text2: 'You have been successfully logged in.',
        visibilityTime: 4000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Please check your credentials and try again.',
        visibilityTime: 4000,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      Toast.show({
        type: 'success',
        text1: 'Welcome',
        text2: 'Successfully logged in with Google.',
        visibilityTime: 4000,
      });
    } catch (error: any) {
      console.error('Google login error in LoginScreen:', error);
      Toast.show({
        type: 'error',
        text1: 'Google Login Failed',
        text2: error.message || 'Please try again.',
        visibilityTime: 4000,
      });
    }
  };

  const handleModeSwitch = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSignUp(!isSignUp);
    setEmailError('');
    setPasswordError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <LinearGradient
          colors={SPIRITUAL_GRADIENTS.peace}
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Image
                  source={require('../../assets/images/om-symbol.png')}
                  style={styles.omSymbol}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.title}>Spiritual Wisdom</Text>
              <Text style={styles.subtitle}>Find peace in daily wisdom</Text>
            </Animated.View>

            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <Text style={styles.cardTitle}>
                {isSignUp ? 'Join Our Community' : 'Welcome Back'}
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    emailError ? styles.inputError : null
                  ]}
                  placeholder="Email"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null
                  ]}
                  placeholder="Password"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  isLoading && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.googleButton,
                  isLoading && styles.buttonDisabled
                ]}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={handleModeSwitch}
                activeOpacity={0.7}
              >
                <Text style={styles.switchText}>
                  {isSignUp 
                    ? 'Already have an account? Sign In' 
                    : "Don't have an account? Sign Up"
                  }
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  omSymbol: {
    width: 80,
    height: 80,
    marginBottom: 16,
    tintColor: SPIRITUAL_COLORS.omGold,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    ...SPIRITUAL_SHADOWS.divine,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: SPIRITUAL_COLORS.input,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
  },
  inputError: {
    borderColor: SPIRITUAL_COLORS.spiritualRed,
    borderWidth: 2,
  },
  errorText: {
    color: SPIRITUAL_COLORS.spiritualRed,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    ...SPIRITUAL_SHADOWS.card,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    color: SPIRITUAL_COLORS.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: SPIRITUAL_COLORS.border,
  },
  dividerText: {
    color: SPIRITUAL_COLORS.textMuted,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  switchText: {
    color: SPIRITUAL_COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
