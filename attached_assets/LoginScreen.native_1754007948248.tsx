// React Native version of LoginScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

import { useAuth } from './AuthContext';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, loginWithGoogle, isLoading } = useAuth();

  const handleSubmit = async () => {
    try {
      await login(email, password);
      Toast.show({
        type: 'success',
        text1: 'Welcome',
        text2: 'You have been successfully logged in.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Please check your credentials and try again.',
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
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Google Login Failed',
        text2: 'Please try again.',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FDF8F3', '#F4E4C1']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Om Symbol */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/om-symbol.png')}
              style={styles.omSymbol}
              resizeMode="contain"
            />
            <Text style={styles.title}>Spiritual Wisdom</Text>
            <Text style={styles.subtitle}>Find peace in daily wisdom</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isSignUp ? 'Join Our Community' : 'Welcome Back'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8E6A5B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8E6A5B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSubmit}
              disabled={isLoading}
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
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  omSymbol: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E6A5B',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FEFCF8',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1810',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F9F3E9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D1810',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8D5B7',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FEFCF8',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D5B7',
  },
  googleButtonText: {
    color: '#2D1810',
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
    backgroundColor: '#E8D5B7',
  },
  dividerText: {
    color: '#8E6A5B',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  switchText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '500',
  },
});
