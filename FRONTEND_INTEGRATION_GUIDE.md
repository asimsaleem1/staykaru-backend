# Frontend Firebase Authentication Integration Guide

## 🚀 **Backend API URL**
**Base URL:** `https://api.staykaru.tech/api`

## 📋 **Complete Frontend Integration Guide**

### **Step 1: Install Firebase SDK**

#### **For React Native:**
```bash
npm install @react-native-firebase/app @react-native-firebase/auth
# For iOS
cd ios && pod install
```

#### **For Web (React/Next.js):**
```bash
npm install firebase
```

#### **For Flutter:**
```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
```

---

## **Step 2: Firebase Configuration**

### **React Native Configuration**

#### **firebase.js**
```javascript
import auth from '@react-native-firebase/auth';

// Firebase is auto-configured via google-services.json (Android) 
// and GoogleService-Info.plist (iOS)

export { auth };
```

### **Web Configuration**

#### **firebase.js**
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

---

## **Step 3: Authentication Service**

### **authService.js**
```javascript
const API_BASE_URL = 'https://api.staykaru.tech/api';

class AuthService {
  /**
   * Verify Firebase token with backend
   */
  async verifyToken(firebaseToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: firebaseToken })
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  /**
   * Get user profile from backend
   */
  async getUserProfile(firebaseToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: firebaseToken })
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Register new user (Firebase + Backend)
   */
  async registerUser(email, password, name, role = 'student') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API calls
   */
  async makeAuthenticatedRequest(endpoint, options = {}) {
    try {
      const firebaseToken = await this.getCurrentUserToken();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }

  /**
   * Get current user's Firebase token
   */
  async getCurrentUserToken() {
    // Implementation depends on platform (see below)
  }
}

export default new AuthService();
```

---

## **Step 4: Platform-Specific Implementation**

### **React Native Implementation**

#### **AuthContext.js**
```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import authService from './authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update authService method
  authService.getCurrentUserToken = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    return await currentUser.getIdToken();
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get Firebase token
          const token = await firebaseUser.getIdToken();
          
          // Verify with backend and get user data
          const backendUserData = await authService.verifyToken(token);
          
          setUser(firebaseUser);
          setUserData(backendUserData.user);
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, name, role = 'student') => {
    try {
      setLoading(true);
      await authService.registerUser(email, password, name, role);
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      await auth().signInWithEmailAndPassword(email, password);
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

#### **Login Screen (React Native)**
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      // Navigation will be handled by your auth flow
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{ backgroundColor: '#007bff', padding: 15, borderRadius: 5 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={{ marginTop: 10 }}
      >
        <Text style={{ textAlign: 'center', color: '#007bff' }}>
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
```

#### **Register Screen (React Native)**
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Picker } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const { signUp, loading } = useAuth();

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.name, formData.role);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Registration Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Create Account</Text>
      
      <TextInput
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(name) => setFormData({...formData, name})}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(email) => setFormData({...formData, email})}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        placeholder="Password"
        value={formData.password}
        onChangeText={(password) => setFormData({...formData, password})}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(confirmPassword) => setFormData({...formData, confirmPassword})}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Text style={{ marginBottom: 5 }}>I am a:</Text>
      <Picker
        selectedValue={formData.role}
        onValueChange={(role) => setFormData({...formData, role})}
        style={{ borderWidth: 1, marginBottom: 20 }}
      >
        <Picker.Item label="Student" value="student" />
        <Picker.Item label="Landlord" value="landlord" />
      </Picker>
      
      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        style={{ backgroundColor: '#28a745', padding: 15, borderRadius: 5 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={{ marginTop: 10 }}
      >
        <Text style={{ textAlign: 'center', color: '#007bff' }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;
```

---

### **Web (React/Next.js) Implementation**

#### **AuthContext.js (Web)**
```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';
import authService from './authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update authService method for web
  authService.getCurrentUserToken = async () => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    return await auth.currentUser.getIdToken();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const backendUserData = await authService.verifyToken(token);
          
          setUser(firebaseUser);
          setUserData(backendUserData.user);
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, name, role = 'student') => {
    try {
      setLoading(true);
      await authService.registerUser(email, password, name, role);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

---

## **Step 5: Making Authenticated API Calls**

### **Example: Booking a Room**
```javascript
import authService from '../services/authService';

const BookingService = {
  async createBooking(bookingData) {
    return await authService.makeAuthenticatedRequest('/booking', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  async getUserBookings() {
    return await authService.makeAuthenticatedRequest('/booking/user');
  },

  async cancelBooking(bookingId) {
    return await authService.makeAuthenticatedRequest(`/booking/${bookingId}`, {
      method: 'DELETE'
    });
  }
};

export default BookingService;
```

### **Usage in Component**
```javascript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookingService from '../services/BookingService';

const UserBookings = () => {
  const { userData } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      loadBookings();
    }
  }, [userData]);

  const loadBookings = async () => {
    try {
      const userBookings = await BookingService.getUserBookings();
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <Text>Please log in to view your bookings</Text>;
  }

  return (
    <View>
      <Text>Welcome, {userData.name}!</Text>
      <Text>Role: {userData.role}</Text>
      {/* Render bookings */}
    </View>
  );
};
```

---

## **Step 6: Error Handling**

### **Common Error Scenarios**
```javascript
const handleApiError = (error) => {
  if (error.message.includes('401')) {
    // Token expired or invalid
    // Redirect to login
    signOut();
    return 'Your session has expired. Please log in again.';
  } else if (error.message.includes('403')) {
    // Insufficient permissions
    return 'You do not have permission to perform this action.';
  } else if (error.message.includes('500')) {
    // Server error
    return 'Server error. Please try again later.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};
```

---

## **Step 7: App Setup & Navigation**

### **App.js (React Native)**
```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import LoadingScreen from './screens/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Authenticated screens
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
```

---

## **🔐 User Roles & Permissions**

Your backend supports different user roles:
- **student** - Can book accommodations, order food
- **landlord** - Can list accommodations, manage bookings
- **admin** - Full access (if implemented)

The role is automatically set during registration and included in the user data returned from the backend.

---

## **📝 Testing Your Integration**

### **Test User Registration:**
1. Use the register form with valid data
2. Check that user appears in Firebase Console
3. Verify user is created in your MongoDB
4. Confirm user can log in immediately

### **Test Authentication Flow:**
1. Login with created user
2. Check that `userData` contains backend user info
3. Make an authenticated API call
4. Verify logout clears user state

---

## **🚀 Your Authentication is Ready!**

With this setup, your frontend will:
- ✅ Handle user registration and login with Firebase
- ✅ Automatically sync with your backend
- ✅ Include authentication tokens in API calls
- ✅ Manage user sessions and roles
- ✅ Handle errors and edge cases

Your users can now create accounts and authenticate seamlessly! 🎉
