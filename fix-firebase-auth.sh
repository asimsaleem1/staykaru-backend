#!/bin/bash

# Navigate to your frontend directory
cd D:/FYP/stekaro-frontend

# Create directories if they don't exist
mkdir -p src/services
mkdir -p src/types

# Create the auth types file
cat > src/types/auth.types.ts << 'EOL'
// Types related to authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export enum UserRole {
  STUDENT = 'student',
  LANDLORD = 'landlord',
  FOOD_PROVIDER = 'food_provider',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  fcmTokens?: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName?: string;
}
EOL

# Create the firebase service file
cat > src/services/firebase.service.ts << 'EOL'
import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseAuthUser,
  getReactNativePersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterData } from '../types/auth.types';

// Your Firebase configuration
// Update these with your actual Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase - only initialize if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Login with Firebase
export const firebaseLogin = async (credentials: LoginCredentials) => {
  try {
    const { email, password } = credentials;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Firebase login error:', error);
    throw new Error(error.message || 'Failed to login');
  }
};

// Register with Firebase
export const firebaseRegister = async (userData: RegisterData) => {
  try {
    const { email, password } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Firebase registration error:', error);
    throw new Error(error.message || 'Failed to register');
  }
};

// Logout from Firebase
export const firebaseLogout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Firebase logout error:', error);
    throw new Error(error.message || 'Failed to logout');
  }
};

// Get current Firebase user
export const getCurrentFirebaseUser = (): FirebaseAuthUser | null => {
  return auth.currentUser;
};

// Get ID token
export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

export default auth;
EOL

# Update package.json to include @react-native-async-storage/async-storage
npm install @react-native-async-storage/async-storage

echo "Firebase configuration files have been created."
echo "Please update the Firebase config in src/services/firebase.service.ts with your actual project details."
echo "After updating the config, restart the Expo app."
