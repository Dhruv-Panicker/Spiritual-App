
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBI8--3GhLYSWJo8hVeMbwg79zlZBu9qLI",
  authDomain: "gurudarshan-app.firebaseapp.com",
  projectId: "gurudarshan-app",
  storageBucket: "gurudarshan-app.firebasestorage.app",
  messagingSenderId: "802311568887",
  appId: "1:802311568887:web:698f8c5a42cd81167842f2",
  measurementId: "G-XWKB4PQPSE"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
