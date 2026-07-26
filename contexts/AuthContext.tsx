import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';
import { twoFactorService } from '../services/twoFactorService';
import { googleSheetsService } from '../services/googleSheetsService';
import { notificationService } from '../services/notificationService';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  /** Send a login code to an existing account's email. Throws UNVERIFIED_USER if no account. */
  login: (email: string) => Promise<void>;
  /** Complete sign-up after the OTP code has been verified. */
  completeSignUp: (email: string, name: string) => Promise<void>;
  /** Complete login after the OTP code has been verified. */
  completeLogin: (email: string) => Promise<void>;
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

const SESSION_KEY = 'spiritual-app-user';

/** Fallback display name derived from the email address. */
const deriveName = (email: string) => email.split('@')[0].replace(/[._]/g, ' ');

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  /**
   * Load the profile row for the signed-in user, creating it if missing
   * (first sign-up, or an account that predates the profile table).
   */
  const ensureProfile = async (email: string, preferredName?: string): Promise<User> => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: row, error } = await supabase
      .from('users')
      .select('id, name, email, is_admin')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (error) {
      throw new Error('Could not load your profile. Please try again.');
    }
    if (row) {
      return {
        id: row.id,
        name: (row.name || '').trim() || deriveName(normalizedEmail),
        email: row.email,
        isAdmin: row.is_admin === true,
      };
    }
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;
    if (!authUser) {
      throw new Error('Not signed in');
    }
    const name = (preferredName || '').trim() || deriveName(normalizedEmail);
    const { error: insertError } = await supabase
      .from('users')
      .insert({ id: authUser.id, email: normalizedEmail, name });
    // 23505 = row already exists (concurrent insert); safe to continue
    if (insertError && insertError.code !== '23505') {
      throw new Error('Could not create your profile. Please try again.');
    }
    return { id: authUser.id, name, email: normalizedEmail, isAdmin: false };
  };

  const checkExistingSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const sessionEmail = data?.session?.user?.email?.toLowerCase();
      if (!sessionEmail) {
        // No Supabase session (logged out, or a pre-Supabase install): clear stale cache
        await AsyncStorage.removeItem(SESSION_KEY);
        return;
      }
      const saved = await AsyncStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as User;
        if (parsed.email === sessionEmail) {
          console.log('Found existing session for:', parsed.email);
          setUser(parsed);
          return;
        }
      }
      const profile = await ensureProfile(sessionEmail);
      setUser(profile);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error checking existing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /** Shared: set user session, persist, log login, save push token in background */
  const finishSession = async (profile: User) => {
    setUser(profile);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    googleSheetsService.logUserLogin({
      email: profile.email,
      name: profile.name,
      loginTime: new Date().toISOString(),
      isAdmin: profile.isAdmin,
    }).catch(() => {});
    (async () => {
      try {
        await notificationService.initialize();
        let attempt = 0;
        const trySaveToken = async (): Promise<void> => {
          attempt++;
          const pushToken = notificationService.getPushToken() || await notificationService.getStoredPushToken();
          if (pushToken) {
            await googleSheetsService.savePushToken(profile.email, pushToken);
            return;
          }
          if (attempt < 10) setTimeout(() => trySaveToken(), 2000);
        };
        setTimeout(() => trySaveToken(), 3000);
      } catch (_) {}
    })();
  };

  /**
   * Login step 1: send the OTP code. Fails with UNVERIFIED_USER when the
   * email has no account so the UI can point the user to sign-up.
   */
  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      const result = await twoFactorService.sendVerificationCode(normalizedEmail, {
        shouldCreateUser: false,
      });
      if (!result.success) {
        if (result.userNotFound) {
          throw new Error('UNVERIFIED_USER');
        }
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  /** Login step 2: after OTP verification, load the profile and finish. */
  const completeLogin = async (email: string) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const profile = await ensureProfile(normalizedEmail);
      await finishSession(profile);
    } catch (error) {
      console.error('completeLogin error:', error);
      throw error instanceof Error ? error : new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignUp = async (email: string, name: string) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Invalid email');
      }
      const profile = await ensureProfile(normalizedEmail, name);
      await finishSession(profile);
    } catch (error) {
      console.error('completeSignUp error:', error);
      throw error instanceof Error ? error : new Error('Sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await supabase.auth.signOut();
      await AsyncStorage.removeItem(SESSION_KEY);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if sign-out fails, still log the user out locally
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    completeSignUp,
    completeLogin,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
