import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { googleSheetsService } from '../services/googleSheetsService';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '280273015436-7v0b7kaqjjgl23q9iuqj0b01o5ck6qhc.apps.googleusercontent.com', // From Google Cloud Console
      iosClientId: '280273015436-7v0b7kaqjjgl23q9iuqj0b01o5ck6qhc.apps.googleusercontent.com', // From Google Cloud Console
      offlineAccess: false,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
      accountName: '',
    });
    
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // For now, always start with login screen
      // You can enable session persistence later by uncommenting below
      // const savedUser = await AsyncStorage.getItem('spiritual-app-user');
      // if (savedUser) {
      //   setUser(JSON.parse(savedUser));
      // }
      setUser(null);
    } catch (error) {
      console.error('Error checking existing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Add haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Basic email validation
      if (!email.includes('@') || password.length < 3) {
        throw new Error('Invalid credentials');
      }

      const mockUser: User = {
        id: '1',
        name: 'Spiritual Seeker',
        email,
        isAdmin: email === 'admin@example.com'
      };

      setUser(mockUser);
      await AsyncStorage.setItem('spiritual-app-user', JSON.stringify(mockUser));

      // Log user login to Google Sheets (non-blocking)
      googleSheetsService.logUserLogin({
        email: mockUser.email,
        name: mockUser.name,
        loginTime: new Date().toISOString(),
        isAdmin: mockUser.isAdmin
      }).catch(error => {
        console.log('Failed to log to Google Sheets:', error);
        // This is non-blocking - login continues regardless
      });

      // Success haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw new Error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Add haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('Starting Google Sign-In process...');

      // Check if Google Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }

      // Sign in with Google
      const googleUser = await GoogleSignin.signIn();
      console.log('Google Sign-In successful:', googleUser);

      // Extract user information from Google response
      const googleUserInfo = googleUser.data?.user || googleUser.user;
      
      if (!googleUserInfo) {
        throw new Error('No user information received from Google');
      }

      const newUser: User = {
        id: googleUserInfo.id,
        name: googleUserInfo.name || 'Google User',
        email: googleUserInfo.email,
        isAdmin: false // You can add admin logic based on email domains or specific emails
      };

      console.log('Creating user from Google data:', newUser);

      setUser(newUser);
      await AsyncStorage.setItem('spiritual-app-user', JSON.stringify(newUser));

      // Log user login to Google Sheets (non-blocking)
      googleSheetsService.logUserLogin({
        email: newUser.email,
        name: newUser.name,
        loginTime: new Date().toISOString(),
        isAdmin: newUser.isAdmin
      }).catch(error => {
        console.log('Failed to log to Google Sheets:', error);
        // This is non-blocking - login continues regardless
      });

      // Success haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Handle specific Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google sign-in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google sign-in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw new Error('Google authentication failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('=== LOGOUT FUNCTION CALLED ===');
    try {
      console.log('Playing logout haptic feedback');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      console.log('Signing out from Google');
      // Sign out from Google if user is signed in
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.signOut();
          console.log('Google sign-out successful');
        }
      } catch (googleError) {
        console.log('Google sign-out error (non-critical):', googleError);
      }
      
      console.log('Setting user to null');
      // Clear user state immediately
      setUser(null);
      
      console.log('Removing user from AsyncStorage');
      // Clear stored session
      await AsyncStorage.removeItem('spiritual-app-user');
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if storage removal fails, still logout the user
      console.log('Setting user to null despite error');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};