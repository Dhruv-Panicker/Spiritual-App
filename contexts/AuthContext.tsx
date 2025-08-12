import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { isAdminUser } from '../config/adminConfig';

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = isAdminUser(user?.email || '');

  useEffect(() => {
    let isMounted = true;

    // Add delay to ensure Firebase is fully initialized
    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // Small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Setting up auth state listener...');
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isMounted) return;

          try {
            console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
            setUser(firebaseUser);

            // Store user data locally
            if (firebaseUser) {
              try {
                await AsyncStorage.setItem('user', JSON.stringify({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL
                }));
              } catch (storageError) {
                console.warn('Error storing user data:', storageError);
              }
            } else {
              try {
                await AsyncStorage.removeItem('user');
              } catch (storageError) {
                console.warn('Error removing user data:', storageError);
              }
            }
          } catch (authError) {
            console.error('Error handling auth state change:', authError);
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        });

        return unsubscribe;
      } catch (initError) {
        console.error('Firebase auth initialization error:', initError);
        console.warn('Firebase auth not available, using fallback');
        if (isMounted) {
          setIsLoading(false);
        }
        return () => {};
      }
    };

    let unsubscribePromise = initializeAuth();

    return () => {
      isMounted = false;
      unsubscribePromise.then(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  const clearError = () => setError(null);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && userCredential.user) {
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
    try {
      setIsLoading(true);
      setError(null);

      if (typeof window !== 'undefined') {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } else {
        throw new Error('Google Sign-In not available on mobile platform');
      }
    } catch (error: any) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await signOut(auth);
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error: any) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
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