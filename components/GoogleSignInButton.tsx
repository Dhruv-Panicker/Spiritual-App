import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { googleSignInService, GoogleUser } from '../services/googleSignInService';
import { useAuth } from '../contexts/AuthContext';

interface GoogleSignInButtonProps {
  onSignInSuccess?: (user: GoogleUser) => void;
  onSignInError?: (error: Error) => void;
  buttonText?: string;
  style?: any;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSignInSuccess,
  onSignInError,
  buttonText = 'Continue with Google',
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle } = useAuth();

  const handleSignIn = async () => {
    if (!googleSignInService.isConfigured()) {
      Alert.alert(
        'Configuration Required',
        'Google Sign-In is not configured yet. Please set up your Google OAuth credentials.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Starting Google Sign-In process...');
      
      // Use the AuthContext's loginWithGoogle method
      await loginWithGoogle();
      
      console.log('✅ Google Sign-in completed through AuthContext');
      
      // Note: We don't have the user object here since loginWithGoogle handles everything
      // The success callback is mainly for UI feedback
      onSignInSuccess?.({
        id: 'google-user',
        email: 'signed-in@google.com',
        name: 'Google User',
      } as GoogleUser);
      
    } catch (error) {
      console.error('❌ Sign-in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Sign-In Error', errorMessage);
      onSignInError?.(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const showConfiguration = () => {
    // Use the checkConfiguration method to log the configuration
    googleSignInService.checkConfiguration();
    
    Alert.alert(
      'Google Sign-In Configuration',
      `Configuration has been logged to console. Check the app logs for details.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonText}>🔐</Text>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </>
        )}
      </TouchableOpacity>
      
      {!googleSignInService.isConfigured() && (
        <TouchableOpacity style={styles.configButton} onPress={showConfiguration}>
          <Text style={styles.configText}>⚙️ Show Configuration</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  configButton: {
    marginTop: 8,
    padding: 8,
  },
  configText: {
    color: '#666',
    fontSize: 12,
  },
});