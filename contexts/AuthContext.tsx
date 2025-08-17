import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { googleSheetsService } from '../services/googleSheetsService';

// Only import Google Sign-In on native platforms
let GoogleSignin: any = null;
let statusCodes: any = null;

if (Platform.OS !== 'web') {
  try {
    const googleSignInModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSignInModule.GoogleSignin;
    statusCodes = googleSignInModule.statusCodes;
  } catch (error) {
    console.log('Google Sign-In not available on this platform');
  }
}

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
    // Configure Google Sign-In only for native platforms
    if (Platform.OS !== 'web' && GoogleSignin) {
      GoogleSignin.configure({
        webClientId: '461226051776-jtf6a28brt22mss5rjt6itanv740ne66.apps.googleusercontent.com', // From Google Cloud Console
        iosClientId: '461226051776-vuu052uiq6nno9k84ahkdjb9vr4v8qco.apps.googleusercontent.com', // From Google Cloud Console
        offlineAccess: false,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
        accountName: '',
      });
    }
    
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

      // Check if Google Sign-In is available
      if (!GoogleSignin) {
        throw new Error('Google Sign-In is only available on the mobile app. Please use email/password login on web.');
      }

      // Sign in with Google (iOS only now)
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
      
      // Handle specific Google Sign-In errors (only if statusCodes is available)
      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google sign-in was cancelled');
      } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google sign-in is in progress');
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
      // Sign out from Google if user is signed in (only on native platforms)
      if (Platform.OS !== 'web' && GoogleSignin) {
        try {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            await GoogleSignin.signOut();
            console.log('Google sign-out successful');
          }
        } catch (googleError) {
          console.log('Google sign-out error (non-critical):', googleError);
        }
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