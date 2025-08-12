
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { Platform } from 'react-native';

// Import AsyncStorage only when needed
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize auth based on platform
let auth;
try {
  if (Platform.OS === 'web') {
    // For web, use regular getAuth
    auth = getAuth(app);
  } else {
    // For React Native, use initializeAuth with AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  console.log('Auth already initialized, getting existing instance');
  auth = getAuth(app);
}

export { auth };
export default app;
