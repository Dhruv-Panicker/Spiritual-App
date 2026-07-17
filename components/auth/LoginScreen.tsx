import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';
import { styles } from './styles/LoginScreen.styles';

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
              <Text style={styles.titleLine1}>A Living Divine Power</Text>
              <Text style={styles.titleLine2}>Om Siddheshwar</Text>
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
              Om Siddheshwar · Vedic Wisdom · Ancient Path
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};
