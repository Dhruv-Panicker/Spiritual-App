import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { googleSheetsService } from '../services/googleSheetsService';
import { notificationService } from '../services/notificationService';
import { env } from '../config/env';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  /** Log in with email only; checks userbase. No password. */
  login: (email: string) => Promise<void>;
  /** Complete sign-up after 2FA verification; adds user to userbase with verified=yes */
  completeSignUp: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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
        const parsedUser = JSON.parse(savedUser);
        console.log('Found existing session for:', parsedUser.email);
        setUser(parsedUser);
      } else {
        console.log('No existing session found');
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /** Shared: set user session, persist, log login, save push token in background */
  const logUserIn = async (email: string, name: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = env.adminEmails.includes(normalizedEmail);
    const userObj: User = {
      id: normalizedEmail,
      name: name.trim() || normalizedEmail.split('@')[0].replace(/[._]/g, ' '),
      email: normalizedEmail,
      isAdmin,
    };
    setUser(userObj);
    await AsyncStorage.setItem('spiritual-app-user', JSON.stringify(userObj));
    googleSheetsService.logUserLogin({
      email: userObj.email,
      name: userObj.name,
      loginTime: new Date().toISOString(),
      isAdmin: userObj.isAdmin,
    }).catch(() => {});
    (async () => {
      try {
        await notificationService.initialize();
        let attempt = 0;
        const trySaveToken = async (): Promise<void> => {
          attempt++;
          const pushToken = notificationService.getPushToken() || await notificationService.getStoredPushToken();
          if (pushToken) {
            await googleSheetsService.savePushToken(userObj.email, pushToken);
            return;
          }
          if (attempt < 10) setTimeout(() => trySaveToken(), 2000);
        };
        setTimeout(() => trySaveToken(), 3000);
      } catch (_) {}
    })();
  };

  const completeSignUp = async (email: string, name: string) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Invalid email');
      }
      const displayName = (name || '').trim() || normalizedEmail.split('@')[0].replace(/[._]/g, ' ');
      await logUserIn(normalizedEmail, displayName);
      await googleSheetsService.addToUserbase(normalizedEmail, displayName);
    } catch (error) {
      console.error('completeSignUp error:', error);
      throw error instanceof Error ? error : new Error('Sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      const result = await googleSheetsService.checkUserInUserbase(normalizedEmail);
      if (!result.exists) {
        throw new Error('UNVERIFIED_USER');
      }
      await logUserIn(normalizedEmail, result.name || normalizedEmail.split('@')[0]);
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('=== USER LOGOUT ===');
    console.log('User logging out:', user?.email);
    console.log('==================');
    
    try {
      // Clear user state
      setUser(null);
      
      // Clear stored session
      await AsyncStorage.removeItem('spiritual-app-user');
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if storage removal fails, still logout the user
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    completeSignUp,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

