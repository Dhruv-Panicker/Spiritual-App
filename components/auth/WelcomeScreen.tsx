import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { SPIRITUAL_COLORS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

interface WelcomeScreenProps {
  onSignUp: () => void;
  onLogIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSignUp, onLogIn }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Spiritual App</Text>
          <Text style={styles.subtitle}>Welcome to Your Spiritual Journey</Text>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={onSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logInLink} onPress={onLogIn} activeOpacity={0.7}>
            <Text style={styles.logInLinkText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 48,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  signUpButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 18,
    fontWeight: '600',
  },
  logInLink: {
    marginTop: 24,
    paddingVertical: 8,
  },
  logInLinkText: {
    fontSize: 15,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '500',
  },
});
