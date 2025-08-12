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
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase app initialization error:', error);
}

// Initialize auth with platform detection
const initializeFirebaseAuth = async () => {
  if (!app) {
    console.warn('Firebase app not available');
    return false;
  }

  try {
    // Check platform
    const isWeb = typeof window !== 'undefined';

    if (isWeb) {
      // Web platform
      const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      console.log('Firebase auth initialized for web');
    } else {
      // React Native platform
      console.log('Initializing Firebase auth for React Native...');

      // Import required modules
      const { initializeAuth, getReactNativePersistence, GoogleAuthProvider } = await import('firebase/auth');
      const AsyncStorage = await import('@react-native-async-storage/async-storage');

      // Check if auth instance already exists
      try {
        const { getAuth } = await import('firebase/auth');
        auth = getAuth(app);
        console.log('Using existing auth instance');
      } catch {
        // Create new auth instance with AsyncStorage persistence
        console.log('Creating new auth instance with AsyncStorage persistence');
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage.default)
        });
      }

      googleProvider = new GoogleAuthProvider();
      console.log('Firebase auth initialized for React Native with AsyncStorage');
    }

    return true;
  } catch (error) {
    console.error('Firebase auth initialization failed:', error);
    return false;
  }
};

// Export auth objects and initialization function
export { auth, googleProvider, initializeFirebaseAuth };
export default app;