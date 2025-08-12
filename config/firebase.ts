
import { initializeApp, getApps } from 'firebase/app';

// Platform-specific Firebase imports
let auth: any;
let googleProvider: any;

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
let app: any;
try {
  // Check if app already exists, if not create new one
  const existingApps = getApps();
  if (existingApps.length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = existingApps[0];
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Set app to null if initialization fails
  app = null;
}

// Dynamic imports for better web compatibility
const initializeFirebaseAuth = async () => {
  try {
    if (!app) {
      console.warn('Firebase app not initialized, using fallback auth');
      createFallbackAuth();
      return;
    }

    if (typeof window !== 'undefined') {
      // Web platform
      const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    } else {
      // React Native platform
      try {
        const { initializeAuth: initAuth, getReactNativePersistence, GoogleAuthProvider } = await import('firebase/auth');
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        
        // Check if auth is already initialized
        const { getApps } = await import('firebase/app');
        const existingApps = getApps();
        
        if (existingApps.length > 0 && existingApps[0]) {
          // Try to get existing auth first
          try {
            const { getAuth } = await import('firebase/auth');
            auth = getAuth(existingApps[0]);
          } catch (authError) {
            // If getting auth fails, initialize new one
            auth = initAuth(app, {
              persistence: getReactNativePersistence(AsyncStorage.default)
            });
          }
        } else {
          auth = initAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage.default)
          });
        }
        
        googleProvider = new GoogleAuthProvider();
      } catch (rnError) {
        console.warn('React Native Firebase setup failed, using fallback:', rnError);
        createFallbackAuth();
      }
    }
  } catch (error) {
    console.error('Firebase auth initialization error:', error);
    createFallbackAuth();
  }
};

const createFallbackAuth = () => {
  // Provide fallback auth object
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Auth not available')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Auth not available')),
    signOut: () => Promise.reject(new Error('Auth not available')),
    sendPasswordResetEmail: () => Promise.reject(new Error('Auth not available')),
  };
  googleProvider = {
    addScope: () => {},
    setCustomParameters: () => {},
  };
};

// Initialize auth immediately
initializeFirebaseAuth();

export { auth, googleProvider, initializeFirebaseAuth };
export default app;
