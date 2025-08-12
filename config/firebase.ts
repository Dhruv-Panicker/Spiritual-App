
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBI8--3GhLYSWJo8hVeMbwg79zlZBu9qLI",
  authDomain: "gurudarshan-app.firebaseapp.com",
  projectId: "gurudarshan-app",
  storageBucket: "gurudarshan-app.firebasestorage.app",
  messagingSenderId: "802311568887",
  appId: "1:802311568887:web:698f8c5a42cd81167842f2",
  measurementId: "G-XWKB4PQPSE"
};

// Initialize Firebase app
let app: any = null;
let auth: any = null;
let googleProvider: any = null;

try {
  // Check if app already exists
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase app initialization error:', error);
}

// Initialize auth with platform detection
const initializeFirebaseAuth = async () => {
  if (!app) {
    console.warn('Firebase app not available');
    return createFallbackAuth();
  }

  try {
    // Check platform
    const isWeb = typeof window !== 'undefined';
    
    if (isWeb) {
      // Web platform
      const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    } else {
      // React Native platform
      const { initializeAuth, getReactNativePersistence, GoogleAuthProvider, getAuth } = await import('firebase/auth');
      
      try {
        // Try to get existing auth first
        auth = getAuth(app);
      } catch {
        // If no auth exists, create one with persistence
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage');
          auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage.default)
          });
        } catch (persistenceError) {
          // Fallback to auth without persistence
          console.warn('AsyncStorage not available, using memory persistence');
          const { initializeAuth: initAuth } = await import('firebase/auth');
          auth = initAuth(app);
        }
      }
      
      googleProvider = new GoogleAuthProvider();
    }
    
    console.log('Firebase auth initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase auth initialization failed:', error);
    createFallbackAuth();
    return false;
  }
};

const createFallbackAuth = () => {
  console.log('Creating fallback auth');
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      // Call callback with null user
      setTimeout(() => callback(null), 0);
      return () => {}; // Unsubscribe function
    },
    signInWithEmailAndPassword: () => Promise.reject(new Error('Auth service unavailable')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Auth service unavailable')),
    signOut: () => Promise.resolve(),
    sendPasswordResetEmail: () => Promise.reject(new Error('Auth service unavailable')),
  };
  
  googleProvider = {
    addScope: () => {},
    setCustomParameters: () => {},
  };
};

// Export auth objects and initialization function
export { auth, googleProvider, initializeFirebaseAuth };
export default app;
