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
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Starting email/password login...');

      // Basic validation
      if (!email.includes('@') || password.length < 3) {
        throw new Error('Invalid email or password');
      }

      // Check if user is admin based on email (from environment configuration)
      const isAdmin = env.adminEmails.includes(email.toLowerCase());

      // Extract name from email (first part before @)
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      console.log('=== USER LOGIN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Is Admin:', isAdmin);
      console.log('Login Time:', new Date().toISOString());
      console.log('==========================');

      const user: User = {
        id: email, // Use email as ID for now
        name: name,
        email: email,
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
        console.log('Failed to log to Google Sheets:', error);
        // This is non-blocking - login continues regardless
      });

      // Save push token to Google Sheets (non-blocking)
      // This allows admin to send notifications to this user later
      // Note: Notification service should already be initialized in app/_layout.tsx
      (async () => {
        try {
          console.log('🔔 Preparing to save push token for user:', user.email);
          
          // Ensure notification service is initialized (it may already be from app/_layout.tsx)
          console.log('  Ensuring notification service is initialized...');
          await notificationService.initialize();
          
          // Wait a bit longer for token to be ready, then try multiple times
          const maxAttempts = 10; // Increased attempts
          let attempt = 0;
          
          const trySaveToken = async (): Promise<void> => {
            attempt++;
            console.log(`🔄 Attempt ${attempt}/${maxAttempts} to get push token...`);
            
            let pushToken = notificationService.getPushToken();
            console.log('  Current token from service:', pushToken ? pushToken.substring(0, 30) + '...' : 'null');
            
            if (!pushToken) {
              // Try stored token
              console.log('  Token not available, checking stored token...');
              pushToken = await notificationService.getStoredPushToken();
              console.log('  Stored token:', pushToken ? pushToken.substring(0, 30) + '...' : 'null');
            }
            
            if (pushToken) {
              console.log('🎫 Found push token! Saving to Google Sheets...');
              console.log('  Email:', user.email);
              const saved = await googleSheetsService.savePushToken(user.email, pushToken);
              if (saved) {
                console.log('✅ Push token saved successfully to Google Sheets');
              } else {
                console.error('❌ Failed to save push token to Google Sheets');
              }
              return;
            }
            
            // If no token yet and we have more attempts, try again
            if (attempt < maxAttempts) {
              const delay = 2000; // Wait 2 seconds between attempts
              console.log(`  No token yet, waiting ${delay}ms before next attempt...`);
              setTimeout(trySaveToken, delay);
            } else {
              console.error('❌ Could not get push token after', maxAttempts, 'attempts');
            }
          };
          
          // Start trying after a longer delay to ensure initialization is complete
          console.log('  Waiting 3 seconds before first attempt...');
          setTimeout(trySaveToken, 3000);
        } catch (err: any) {
          console.error('❌ Failed to save push token:', err);
          console.error('  Error message:', err?.message);
          console.error('  Error stack:', err?.stack);
        }
      })();

      console.log('✅ Login successful');

    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    // Google Sign-in is temporarily disabled - will be re-implemented later
    throw new Error('Google Sign-in is temporarily disabled. Please use email/password login.');
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
    loginWithGoogle,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

