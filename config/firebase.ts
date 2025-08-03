
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
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Dynamic imports for better web compatibility
const initializeAuth = async () => {
  try {
    if (typeof window !== 'undefined') {
      // Web platform
      const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    } else {
      // React Native platform
      const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    }
  } catch (error) {
    console.error('Firebase auth initialization error:', error);
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
  }
};

// Initialize auth immediately
initializeAuth();

export { auth, googleProvider };
export default app;
