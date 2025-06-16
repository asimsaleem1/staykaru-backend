# StayKaru Mobile App Authentication Integration Guide

This guide provides comprehensive instructions for implementing authentication in the StayKaru mobile application. It covers the full authentication flow from setup to implementation, with code examples for both iOS and Android using React Native.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Firebase Setup](#firebase-setup)
4. [Authentication Flow](#authentication-flow)
5. [Implementation](#implementation)
   - [Installation](#installation)
   - [Configuration](#configuration)
   - [User Registration](#user-registration)
   - [User Login](#user-login)
   - [Token Management](#token-management)
   - [Protected Routes](#protected-routes)
   - [User Profile](#user-profile)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Overview

The StayKaru mobile app uses Firebase Authentication for user authentication, which is integrated with our backend server. The system supports multiple user roles:

- Student
- Landlord
- Food Provider
- Admin

Each role has different permissions and access levels within the application.

## Prerequisites

- React Native development environment
- Node.js and npm/yarn
- Firebase project with Authentication enabled
- StayKaru backend API access

## Firebase Setup

1. **Create a Firebase Project** (if not already done):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use the existing StayKaru project

2. **Add your mobile app to Firebase**:
   - Click "Add app" and select iOS/Android platforms
   - Follow the setup instructions for each platform
   - Download the configuration files:
     - For iOS: `GoogleService-Info.plist`
     - For Android: `google-services.json`

3. **Enable Authentication Methods**:
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable Email/Password authentication
   - Optionally enable other methods (Google, Apple, etc.)

## Authentication Flow

The authentication flow in StayKaru follows these steps:

1. User registers or logs in through the mobile app
2. Firebase authenticates the user and provides a Firebase ID token
3. The token is sent to the StayKaru backend API for validation
4. Backend validates the token, creates/retrieves the user profile, and returns user data
5. Mobile app stores the token and user data for subsequent API calls
6. The user is redirected to the appropriate dashboard based on their role

## Implementation

### Installation

Install the required packages:

```bash
# Install Firebase packages
npm install @react-native-firebase/app @react-native-firebase/auth

# Install secure storage for tokens
npm install @react-native-async-storage/async-storage

# Install navigation (if not already installed)
npm install @react-navigation/native @react-navigation/stack
```

### Configuration

1. **Configure Firebase in your React Native app**:

**For iOS**: Place the `GoogleService-Info.plist` file in the iOS app directory.

**For Android**: Place the `google-services.json` file in the android/app directory.

2. **Create a Firebase configuration file** (`src/config/firebase.js`):

```javascript
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

// Firebase will automatically use the configuration from the native layer
const firebaseApp = initializeApp();

export { firebaseApp, auth };
```

3. **Create an API service** (`src/services/api.js`):

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.staykaru.tech'; // Replace with your actual API URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

### User Registration

Create a registration screen (`src/screens/RegisterScreen.js`):

```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Create user in Firebase
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // 2. Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // 3. Register user in StayKaru backend
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
        role
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      // 4. Save auth token
      await AsyncStorage.setItem('auth_token', idToken);
      
      // 5. Save user data
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      // 6. Navigate to dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      let errorMessage = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password (min 8 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Text style={styles.label}>Select Role:</Text>
      <Picker
        selectedValue={role}
        onValueChange={(itemValue) => setRole(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Student" value="student" />
        <Picker.Item label="Landlord" value="landlord" />
        <Picker.Item label="Food Provider" value="food_provider" />
      </Picker>
      
      <Button
        title={loading ? "Creating Account..." : "Register"}
        onPress={handleRegister}
        disabled={loading}
      />
      
      <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  label: {
    marginBottom: 5,
  },
  picker: {
    marginBottom: 15,
  },
  loginLink: {
    marginTop: 20,
    textAlign: 'center',
    color: 'blue',
  }
});

export default RegisterScreen;
```

### User Login

Create a login screen (`src/screens/LoginScreen.js`):

```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Sign in with Firebase
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      // 2. Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // 3. Login to StayKaru backend
      const response = await api.post('/auth/login', {
        email,
        password
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      // 4. Save auth token
      await AsyncStorage.setItem('auth_token', idToken);
      
      // 5. Save user data
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      // 6. Navigate to dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      let errorMessage = 'Login failed';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to StayKaru</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />
      
      <Text style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
        Forgot Password?
      </Text>
      
      <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  forgotPassword: {
    marginTop: 15,
    textAlign: 'center',
    color: 'blue',
  },
  registerLink: {
    marginTop: 20,
    textAlign: 'center',
    color: 'blue',
  }
});

export default LoginScreen;
```

### Token Management

Create an authentication context to manage the authentication state (`src/context/AuthContext.js`):

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Check if there's a stored token
        const token = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('user_data');
        
        if (token && userData) {
          // Verify the token is still valid
          const currentUser = auth().currentUser;
          if (currentUser) {
            setUser(JSON.parse(userData));
          } else {
            // If Firebase session expired, clear local storage
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user_data');
          }
        }
      } catch (error) {
        console.log('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
    
    // Set up Firebase auth state listener
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get fresh token
          const idToken = await firebaseUser.getIdToken(true);
          // Store the token
          await AsyncStorage.setItem('auth_token', idToken);
          
          // Get user data if not already loaded
          if (!user) {
            const userData = await AsyncStorage.getItem('user_data');
            if (userData) {
              setUser(JSON.parse(userData));
            } else {
              // Fetch user data from backend
              const response = await api.get('/user/profile', {
                headers: {
                  Authorization: `Bearer ${idToken}`
                }
              });
              
              setUser(response.data);
              await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
            }
          }
        } catch (error) {
          console.log('Error refreshing token:', error);
        }
      } else {
        // User is signed out
        setUser(null);
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
      }
      setLoading(false);
    });

    // Clean up subscription
    return unsubscribe;
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      setUser(null);
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
```

### Protected Routes

Create a navigation structure with protected routes (`src/navigation/AppNavigator.js`):

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// App Screens
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### User Profile

Create a dashboard screen that displays user information based on role (`src/screens/DashboardScreen.js`):

```javascript
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';

const DashboardScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case 'student':
        return (
          <View style={styles.roleContainer}>
            <Text style={styles.roleTitle}>Student Dashboard</Text>
            <Text>Find accommodation and food services near your campus.</Text>
            <View style={styles.buttonContainer}>
              <Button title="Browse Accommodations" onPress={() => navigation.navigate('Accommodations')} />
              <Button title="Browse Food Services" onPress={() => navigation.navigate('FoodServices')} />
            </View>
          </View>
        );
      case 'landlord':
        return (
          <View style={styles.roleContainer}>
            <Text style={styles.roleTitle}>Landlord Dashboard</Text>
            <Text>Manage your properties and bookings.</Text>
            <View style={styles.buttonContainer}>
              <Button title="My Properties" onPress={() => navigation.navigate('MyProperties')} />
              <Button title="Booking Requests" onPress={() => navigation.navigate('BookingRequests')} />
            </View>
          </View>
        );
      case 'food_provider':
        return (
          <View style={styles.roleContainer}>
            <Text style={styles.roleTitle}>Food Provider Dashboard</Text>
            <Text>Manage your menu and orders.</Text>
            <View style={styles.buttonContainer}>
              <Button title="My Menu" onPress={() => navigation.navigate('MyMenu')} />
              <Button title="Current Orders" onPress={() => navigation.navigate('CurrentOrders')} />
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.roleContainer}>
            <Text style={styles.roleTitle}>Welcome to StayKaru</Text>
            <Text>Something went wrong with your account. Please contact support.</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {renderRoleSpecificContent()}

      <View style={styles.footer}>
        <Button title="View Profile" onPress={() => navigation.navigate('Profile')} />
        <Button title="Logout" onPress={signOut} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    color: 'gray',
  },
  roleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  footer: {
    marginTop: 20,
  },
});

export default DashboardScreen;
```

## Testing

To properly test your authentication implementation:

1. **Create test accounts** for each user role:
   - Create accounts with different roles (student, landlord, food provider)
   - Verify that the dashboard adapts based on the user's role

2. **Test error scenarios**:
   - Invalid credentials
   - Network errors
   - Token expiration

3. **Test the complete user flow**:
   - Registration → Login → Dashboard → Logout
   - Verify that protected routes aren't accessible without authentication

## Troubleshooting

**Common Issues and Solutions:**

1. **Firebase token expiration**:
   - Firebase tokens expire after 1 hour by default
   - Implement token refresh as shown in the AuthContext

2. **Network connectivity issues**:
   - Add proper error handling for network failures
   - Implement retry logic for important operations

3. **Cross-platform issues**:
   - Some Firebase features may behave differently on iOS vs Android
   - Test authentication on both platforms

4. **Authentication state persistence**:
   - If users are unexpectedly logged out, check your token storage implementation
   - Ensure AsyncStorage is properly persisting tokens

For more information, refer to the [Firebase Authentication Documentation](https://firebase.google.com/docs/auth) and the [StayKaru API Documentation](https://api.staykaru.com/docs).

---

For any questions or issues, please contact the StayKaru development team.
