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
import { useAuth } from '@/contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Login Failed', errorMessage);
      console.error('Login error:', error);
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
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={SPIRITUAL_COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  editable={!isLoading}
                />

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

              <Text style={styles.infoText}>
                Sign in with your email and password.
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
  infoText: {
    marginTop: 30,
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
});

