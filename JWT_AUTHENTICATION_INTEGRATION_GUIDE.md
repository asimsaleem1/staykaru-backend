# JWT Authentication Integration Guide

This guide provides detailed instructions for integrating the new JWT-based authentication system with the StayKaru frontend application.

## Overview

The StayKaru backend has migrated from Firebase authentication to a MongoDB/JWT-based authentication system. This document guides you through updating the frontend to work with the new authentication system.

## API Endpoints

The authentication API provides the following endpoints:

- **POST /auth/register** - Register a new user
- **POST /auth/login** - Login and receive a JWT token
- **GET /auth/profile** - Get the user profile (protected route)

## API URL

The production API base URL is: `https://api.staykaru.tech/api`
For local development, use: `http://localhost:3002`

## API Client Updates

Update your API client configuration to include the authorization header with the JWT token for authenticated requests:

```javascript
// src/api/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.staykaru.tech/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token to every request
apiClient.interceptors.request.use(
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

// Add a response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 Unauthorized and the request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Log out the user if the token is invalid or expired
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      
      // Redirect to login screen or dispatch logout action
      // (This will depend on your navigation and state management setup)
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Authentication Context

Update your authentication context to use the new JWT-based authentication system:

```javascript
// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSignout, setIsSignout] = useState(false);

  // Check if the user is already logged in
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const user = await AsyncStorage.getItem('user_data');
        
        if (token && user) {
          setUserToken(token);
          setUserData(JSON.parse(user));
        }
      } catch (e) {
        console.log('Failed to load authentication state', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Auth context values and functions
  const authContext = {
    isLoading,
    userToken,
    userData,
    isSignout,
    
    register: async (name, email, password, role, phone, gender) => {
      setIsLoading(true);
      try {
        const response = await apiClient.post('/auth/register', {
          name,
          email,
          password,
          role,
          phone,
          gender
        });
        
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        return { 
          success: false, 
          error: error.response?.data?.message || 'Registration failed' 
        };
      } finally {
        setIsLoading(false);
      }
    },
    
    login: async (email, password) => {
      setIsLoading(true);
      try {
        const response = await apiClient.post('/auth/login', {
          email,
          password
        });
        
        const { access_token, user } = response.data;
        
        await AsyncStorage.setItem('auth_token', access_token);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        
        setUserToken(access_token);
        setUserData(user);
        setIsSignout(false);
        
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        return { 
          success: false, 
          error: error.response?.data?.message || 'Invalid email or password' 
        };
      } finally {
        setIsLoading(false);
      }
    },
    
    logout: async () => {
      setIsLoading(true);
      try {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
        
        setUserToken(null);
        setUserData(null);
        setIsSignout(true);
      } catch (e) {
        console.error('Logout error:', e);
      } finally {
        setIsLoading(false);
      }
    },
    
    getUserProfile: async () => {
      try {
        const response = await apiClient.get('/auth/profile');
        const userData = response.data.user;
        
        // Update stored user data
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        setUserData(userData);
        
        return { success: true, data: userData };
      } catch (error) {
        console.error('Profile fetch error:', error.response?.data || error.message);
        return { 
          success: false, 
          error: error.response?.data?.message || 'Failed to fetch profile' 
        };
      }
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
```

## Login Screen Example

Update your login screen to use the new authentication system:

```javascript
// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginScreen = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState(null);

  const handleLogin = async (values) => {
    setError(null);
    
    const result = await login(values.email, values.password);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to StayKaru</Text>
      
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
            />
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkText}>Don't have an account? Register</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#2196F3',
  },
});

export default LoginScreen;
```

## Registration Screen Example

```javascript
// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .oneOf(['student', 'landlord', 'food_provider'], 'Please select a valid role')
    .required('Role is required'),
  phone: Yup.string()
    .required('Phone number is required'),
  gender: Yup.string()
    .required('Gender is required'),
});

const RegisterScreen = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const [error, setError] = useState(null);

  const handleRegister = async (values) => {
    setError(null);
    
    const result = await register(
      values.name,
      values.email,
      values.password,
      values.role,
      values.phone,
      values.gender
    );
    
    if (result.success) {
      navigation.navigate('Login');
    } else {
      setError(result.error);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        
        <Formik
          initialValues={{ 
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '',
            role: 'student',
            phone: '',
            gender: 'male'
          }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                secureTextEntry
              />
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
                secureTextEntry
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                value={values.phone}
                keyboardType="phone-pad"
              />
              {touched.phone && errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
              
              <Text style={styles.label}>Role</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.role}
                  onValueChange={(itemValue) => setFieldValue('role', itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Student" value="student" />
                  <Picker.Item label="Landlord" value="landlord" />
                  <Picker.Item label="Food Provider" value="food_provider" />
                </Picker>
              </View>
              {touched.role && errors.role && (
                <Text style={styles.errorText}>{errors.role}</Text>
              )}
              
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.gender}
                  onValueChange={(itemValue) => setFieldValue('gender', itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
              {touched.gender && errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
              
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
              
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#2196F3',
  },
});

export default RegisterScreen;
```

## Navigation Integration

Update your navigation to check for authentication:

```javascript
// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createStackNavigator();

// Auth navigator for unauthenticated users
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// App navigator for authenticated users
const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    {/* Add other screens for authenticated users */}
  </Stack.Navigator>
);

// Root navigator that decides which stack to show based on auth state
const RootNavigator = () => {
  const { isLoading, userToken, isSignout } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <Stack.Screen 
            name="App" 
            component={AppStack} 
            options={{
              animationEnabled: false,
              animation: isSignout ? 'fade' : 'default',
            }}
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthStack} 
            options={{
              animationEnabled: false,
              animation: 'fade',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Wrap the root navigator with the auth provider
const AppNavigator = () => (
  <AuthProvider>
    <RootNavigator />
  </AuthProvider>
);

export default AppNavigator;
```

## Package Dependencies

Make sure you have these packages installed:

```bash
npm install @react-native-async-storage/async-storage axios formik yup
npm install @react-navigation/native @react-navigation/stack
npm install @react-native-picker/picker
```

## Migration Checklist

- [ ] Update API client with JWT token handling
- [ ] Update AuthContext with JWT authentication logic
- [ ] Remove all Firebase authentication imports and code
- [ ] Update Login and Registration screens
- [ ] Update Navigation to use the new auth context
- [ ] Test registration, login, and protected routes
- [ ] Handle token expiration and auth errors

## Testing

Make sure to thoroughly test the authentication flow:

1. User registration with all required fields
2. User login with correct and incorrect credentials
3. Protected route access with and without a valid token
4. Token expiration handling
5. Logout functionality

## API Error Handling

Be sure to handle these common authentication errors:

- 400 Bad Request: Invalid input data (e.g., invalid email format)
- 401 Unauthorized: Invalid credentials or expired token
- 409 Conflict: Email already exists during registration
- 500 Server Error: Backend issues

## Support

If you encounter any issues during integration, contact the backend team for assistance.
