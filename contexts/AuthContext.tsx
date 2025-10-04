import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { googleSheetsService } from '../services/googleSheetsService';
import { googleSignInService, GoogleUser } from '../services/googleSignInService';

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
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    console.log('=== CHECKING EXISTING SESSION ===');
    try {
      // For now, always start with login screen
      // You can enable session persistence later by uncommenting below
      // const savedUser = await AsyncStorage.getItem('spiritual-app-user');
      // if (savedUser) {
      //   const parsedUser = JSON.parse(savedUser);
      //   console.log('Found existing session for:', parsedUser.email);
      //   console.log('Admin status:', parsedUser.isAdmin);
      //   setUser(parsedUser);
      // } else {
      //   console.log('No existing session found');
      // }
      console.log('Session persistence disabled - requiring fresh login');
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

      // Hardcoded admin emails
      const ADMIN_EMAILS = [
        'dhru.panicker@gmail.com',
        'apparanddhruv@gmail.com'
      ];

      // Check if user is admin based on email
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

      // Console log for web login tracking
      console.log('=== USER LOGIN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Is Admin:', isAdmin);
      console.log('Login Time:', new Date().toISOString());
      console.log('==========================');
      
      // Also log to Metro bundler using console.warn which shows in terminal
      console.warn('🔐 LOGIN:', email, '| Admin:', isAdmin);

      const mockUser: User = {
        id: '1',
        name: 'Spiritual Seeker',
        email,
        isAdmin
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
      console.log('🔐 Starting Google Sign-In...');
      
      const googleUser = await googleSignInService.signIn();
      
      if (!googleUser) {
        throw new Error('Google sign-in was cancelled');
      }

      // Hardcoded admin emails
      const ADMIN_EMAILS = [
        'dhru.panicker@gmail.com',
        'apparanddhruv@gmail.com'
      ];

      // Check if user is admin based on email
      const isAdmin = ADMIN_EMAILS.includes(googleUser.email.toLowerCase());

      // Console log for tracking
      console.log('=== GOOGLE USER LOGIN ===');
      console.log('Email:', googleUser.email);
      console.log('Name:', googleUser.name);
      console.log('Is Admin:', isAdmin);
      console.log('Login Time:', new Date().toISOString());
      console.log('Google ID:', googleUser.id);
      console.log('=========================');
      
      console.warn('🔐 GOOGLE LOGIN:', googleUser.email, '| Admin:', isAdmin);

      const user: User = {
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        isAdmin
      };

      setUser(user);
      await AsyncStorage.setItem('spiritual-app-user', JSON.stringify(user));

      // Log user login to Google Sheets (non-blocking)
      googleSheetsService.logUserLogin({
        email: user.email,
        name: user.name,
        loginTime: new Date().toISOString(),
        isAdmin: user.isAdmin
      }).catch(error => {
        console.log('Failed to log Google login to Google Sheets:', error);
      });

    } catch (error) {
      console.error('Google login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('=== USER LOGOUT ===');
    console.log('User logging out:', user?.email);
    console.log('Was admin:', user?.isAdmin);
    console.log('Logout time:', new Date().toISOString());
    console.log('==================');
    
    // Also log to Metro bundler using console.warn which shows in terminal
    console.warn('🚪 LOGOUT:', user?.email, '| Was admin:', user?.isAdmin);
    
    try {
      // Skip haptics on web for now - might be causing issues
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Clear user state immediately
      setUser(null);
      
      // Clear stored session
      await AsyncStorage.removeItem('spiritual-app-user');
      
      console.log('User logged out successfully');
      console.warn('✅ LOGOUT SUCCESSFUL for:', user?.email);
    } catch (error) {
      console.error('Error during logout:', error);
      console.warn('❌ LOGOUT ERROR:', error);
      // Even if storage removal fails, still logout the user
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