import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBeS4bJZjLqPfY7WiX2CI8VqSMN7HdcDnA',
  authDomain: 'ahion-e7b57.firebaseapp.com',
  projectId: 'ahion-e7b57',
  storageBucket: 'ahion-e7b57.firebasestorage.app',
  messagingSenderId: '376085608330',
  appId: '1:376085608330:android:2c97fc1f8cdef395d67a73',
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth
// Note: Firebase web SDK uses memory persistence by default in React Native
// For persistent auth state, consider using @react-native-firebase/auth instead
// The warning about AsyncStorage is expected - auth will work but won't persist between app restarts
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default db;
