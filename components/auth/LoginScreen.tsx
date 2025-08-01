
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../../contexts/AuthContext';

const SPIRITUAL_COLORS = {
  background: '#FDF8F3',
  cardBackground: '#FFFFFF',
  primary: '#FF6B35',
  primaryForeground: '#FFFFFF',
  foreground: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  input: '#F9FAFB',
  omGold: '#DAA520',
  spiritualRed: '#DC2626',
  spiritualBlue: '#2563EB',
};

const SPIRITUAL_GRADIENTS = {
  peace: ['#FDF8F3', '#F4E4C1'],
  divine: ['#FF6B35', '#FF8F65'],
};

const SPIRITUAL_SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  divine: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  peaceful: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  
  const { login, signup, loginWithGoogle, isLoading } = useAuth();
  
  // Animation references
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Sacred pulse animation for Om symbol
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setNameError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    // Name validation for signup
    if (isSignUp) {
      if (!name.trim()) {
        setNameError('Name is required');
        isValid = false;
      } else if (name.trim().length < 2) {
        setNameError('Name must be at least 2 characters');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      if (isSignUp) {
        await signup(email.trim(), password, name.trim());
        Toast.show({
          type: 'success',
          text1: 'Welcome!',
          text2: 'Your account has been created successfully.',
          visibilityTime: 3000,
        });
      } else {
        await login(email.trim(), password);
        Toast.show({
          type: 'success',
          text1: 'Welcome Back',
          text2: 'You have been successfully logged in.',
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: isSignUp ? 'Signup Failed' : 'Login Failed',
        text2: error.message || 'Please try again.',
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
        visibilityTime: 3000,
      });
    } catch (error: any) {
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
    // Clear form and errors
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setName('');
    setPassword('');
  };

  const clearFieldError = (field: string) => {
    switch (field) {
      case 'email':
        if (emailError) setEmailError('');
        break;
      case 'password':
        if (passwordError) setPasswordError('');
        break;
      case 'name':
        if (nameError) setNameError('');
        break;
    }
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
            <Animated.View 
              style={[
                styles.logoContainer, 
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
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

            <Animated.View 
              style={[
                styles.card, 
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.cardTitle}>
                {isSignUp ? 'Join Our Spiritual Community' : 'Welcome Back, Seeker'}
              </Text>
              
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      nameError ? styles.inputError : null
                    ]}
                    placeholder="Enter your full name"
                    placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      clearFieldError('name');
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                  {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[
                    styles.input,
                    emailError ? styles.inputError : null
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearFieldError('email');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearFieldError('password');
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
                <LinearGradient
                  colors={SPIRITUAL_GRADIENTS.divine}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
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
                <Text style={styles.googleButtonText}>🚀 Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={handleModeSwitch}
                activeOpacity={0.7}
              >
                <Text style={styles.switchText}>
                  {isSignUp 
                    ? 'Already on your spiritual journey? Sign In' 
                    : "New to spiritual wisdom? Join Us"
                  }
                </Text>
              </TouchableOpacity>
              
              {!isSignUp && (
                <View style={styles.helpText}>
                  <Text style={styles.helpTextContent}>
                    Demo: test@example.com / password
                  </Text>
                </View>
              )}
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
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  omSymbol: {
    width: 90,
    height: 90,
    marginBottom: 20,
    tintColor: SPIRITUAL_COLORS.omGold,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 20,
    padding: 28,
    ...SPIRITUAL_SHADOWS.divine,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: SPIRITUAL_COLORS.input,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    borderWidth: 2,
    borderColor: SPIRITUAL_COLORS.border,
  },
  inputError: {
    borderColor: SPIRITUAL_COLORS.spiritualRed,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: SPIRITUAL_COLORS.spiritualRed,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  button: {
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  primaryButton: {
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: SPIRITUAL_COLORS.border,
    ...SPIRITUAL_SHADOWS.card,
    padding: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  googleButtonText: {
    color: SPIRITUAL_COLORS.foreground,
    fontSize: 17,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
    fontWeight: '500',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  switchText: {
    color: SPIRITUAL_COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  helpText: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  helpTextContent: {
    fontSize: 13,
    color: SPIRITUAL_COLORS.textMuted,
    fontWeight: '500',
  },
});
