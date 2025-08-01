
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

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
    try {
      const savedUser = await AsyncStorage.getItem('spiritual-app-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
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
      
      // Simulate Google OAuth - replace with actual Google OAuth implementation
      // You would integrate with expo-auth-session or @react-native-google-signin/google-signin
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: '2',
        name: 'Google User',
        email: 'user@gmail.com',
        isAdmin: false
      };
      
      setUser(mockUser);
      await AsyncStorage.setItem('spiritual-app-user', JSON.stringify(mockUser));
      
      // Success haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw new Error('Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await AsyncStorage.removeItem('spiritual-app-user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear user state even if AsyncStorage fails
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
