
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
let authInitialized = false;

// Initialize Firebase auth functions
const initializeAuthFunctions = async () => {
  if (authInitialized) return;
  
  try {
    console.log('Initializing Firebase auth functions...');
    
    // Import Firebase modules
    const firebaseAuth = await import('firebase/auth');
    const firebaseConfig = await import('../config/firebase');
    
    // Set Firebase functions
    User = firebaseAuth.User;
    signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword;
    createUserWithEmailAndPassword = firebaseAuth.createUserWithEmailAndPassword;
    signOut = firebaseAuth.signOut;
    onAuthStateChanged = firebaseAuth.onAuthStateChanged;
    signInWithPopup = firebaseAuth.signInWithPopup;
    GoogleAuthProvider = firebaseAuth.GoogleAuthProvider;
    sendPasswordResetEmail = firebaseAuth.sendPasswordResetEmail;
    updateProfile = firebaseAuth.updateProfile;
    
    // Initialize Firebase auth
    const initialized = await firebaseConfig.initializeFirebaseAuth();
    
    if (initialized) {
      auth = firebaseConfig.auth;
      googleProvider = firebaseConfig.googleProvider;
      authInitialized = true;
      console.log('Firebase auth functions initialized successfully');
    } else {
      console.warn('Firebase auth initialization failed, using fallback');
    }
    
  } catch (error) {
    console.error('Firebase auth import error:', error);
    // Don't throw error, just continue with fallback
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
    throw new Error('useAuth must be used within an AuthProvider');
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
  const [initialized, setInitialized] = useState(false);

  // Check if current user is admin
  const isAdmin = isAdminUser(user?.email);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // Initialize Firebase functions
        await initializeAuthFunctions();
        
        if (!isMounted) return;
        
        setInitialized(true);
        
        // Set up auth state listener
        if (auth && onAuthStateChanged && typeof onAuthStateChanged === 'function') {
          console.log('Setting up auth state listener...');
          
          unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
            if (!isMounted) return;
            
            try {
              console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
              setUser(firebaseUser);
              
              // Store user data locally
              if (firebaseUser) {
                await AsyncStorage.setItem('user', JSON.stringify({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL
                }));
              } else {
                await AsyncStorage.removeItem('user');
              }
            } catch (storageError) {
              console.error('Error handling auth state change:', storageError);
            } finally {
              if (isMounted) {
                setIsLoading(false);
              }
            }
          });
        } else {
          console.log('Auth state listener not available, using fallback');
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setError('Authentication service temporarily unavailable');
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth state:', error);
        }
      }
    };
  }, []);

  const clearError = () => setError(null);

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!initialized || !createUserWithEmailAndPassword) {
      throw new Error('Authentication service not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
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
    if (!initialized || !signInWithEmailAndPassword) {
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
    if (!initialized || !signInWithPopup) {
      throw new Error('Google Sign-In not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (typeof window !== 'undefined') {
        await signInWithPopup(auth, googleProvider);
      } else {
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
    if (!initialized || !signOut) {
      // Even if auth is not available, clear local state
      setUser(null);
      await AsyncStorage.removeItem('user');
      return;
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
    if (!initialized || !sendPasswordResetEmail) {
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
