import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
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

      // Check if user is admin based on email
      const adminEmails = [
        'dhru.panicker@gmail.com',
        'apaaranddhruv@gmail.com'
      ];

      const mockUser: User = {
        id: '1',
        name: 'Spiritual Seeker',
        email,
        isAdmin: adminEmails.includes(email.toLowerCase())
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

  

  const logout = async () => {
    console.log('=== LOGOUT FUNCTION CALLED ===');
    try {
      console.log('Playing logout haptic feedback');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
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
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};