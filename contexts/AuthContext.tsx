
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAdminUser } from '../config/adminConfig';

// Dynamic Firebase imports
let User: any;
let signInWithEmailAndPassword: any;
let createUserWithEmailAndPassword: any;
let signOut: any;
let onAuthStateChanged: any;
let signInWithPopup: any;
let GoogleAuthProvider: any;
let sendPasswordResetEmail: any;
let updateProfile: any;
let auth: any;
let googleProvider: any;

// Initialize Firebase auth functions
const initializeFirebaseAuth = async () => {
  try {
    const firebaseAuth = await import('firebase/auth');
    const firebaseConfig = await import('../config/firebase');
    
    User = firebaseAuth.User;
    signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword;
    createUserWithEmailAndPassword = firebaseAuth.createUserWithEmailAndPassword;
    signOut = firebaseAuth.signOut;
    onAuthStateChanged = firebaseAuth.onAuthStateChanged;
    signInWithPopup = firebaseAuth.signInWithPopup;
    GoogleAuthProvider = firebaseAuth.GoogleAuthProvider;
    sendPasswordResetEmail = firebaseAuth.sendPasswordResetEmail;
    updateProfile = firebaseAuth.updateProfile;
    
    auth = firebaseConfig.auth;
    googleProvider = firebaseConfig.googleProvider;
  } catch (error) {
    console.error('Firebase auth import error:', error);
  }
};

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Provide a complete fallback context to prevent crashes
    const fallbackContext: AuthContextType = {
      user: null,
      isAdmin: false,
      isLoading: false,
      signUp: async () => { throw new Error('Auth not initialized'); },
      signIn: async () => { throw new Error('Auth not initialized'); },
      signInWithGoogle: async () => { throw new Error('Auth not initialized'); },
      logout: async () => { throw new Error('Auth not initialized'); },
      resetPassword: async () => { throw new Error('Auth not initialized'); },
      error: null,
      clearError: () => {}
    };
    return fallbackContext;
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check if current user is admin
  const isAdmin = isAdminUser(user?.email);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initAuth = async () => {
      try {
        await initializeFirebaseAuth();
        setAuthInitialized(true);
        
        if (auth && onAuthStateChanged) {
          unsubscribe = onAuthStateChanged(auth, async (user: any) => {
            try {
              setUser(user);
              if (user) {
                // Store user data locally for persistence
                await AsyncStorage.setItem('user', JSON.stringify({
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL
                }));
              } else {
                await AsyncStorage.removeItem('user');
              }
            } catch (error) {
              console.error('Error handling auth state change:', error);
              setError('Failed to sync user data');
            } finally {
              setIsLoading(false);
            }
          });
        } else {
          console.warn('Firebase auth not available, using fallback');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Firebase auth:', error);
        setError('Firebase authentication service unavailable');
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const clearError = () => setError(null);

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!authInitialized || !createUserWithEmailAndPassword) {
      throw new Error('Authentication service not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName && userCredential.user && updateProfile) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: any) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!authInitialized || !signInWithEmailAndPassword) {
      throw new Error('Authentication service not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!authInitialized || !signInWithPopup) {
      throw new Error('Google Sign-In not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // For web platform
      if (typeof window !== 'undefined') {
        await signInWithPopup(auth, googleProvider);
      } else {
        // For mobile platforms, you would use @react-native-google-signin/google-signin
        throw new Error('Google Sign-In not implemented for mobile yet');
      }
    } catch (error: any) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!authInitialized || !signOut) {
      throw new Error('Authentication service not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await signOut(auth);
      await AsyncStorage.removeItem('user');
    } catch (error: any) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!authInitialized || !sendPasswordResetEmail) {
      throw new Error('Password reset not available');
    }
    
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(getErrorMessage(error));
      throw error;
    }
  };

  const getErrorMessage = (error: any): string => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const value: AuthContextType = {
    user,
    isAdmin,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
