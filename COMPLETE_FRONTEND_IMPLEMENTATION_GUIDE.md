# COMPREHENSIVE FRONTEND IMPLEMENTATION PROMPT
# StayKaru App - JWT Authentication Migration & Password Management Features

## 🎯 OBJECTIVE
Migrate the StayKaru React Native frontend from Firebase authentication to JWT-based authentication and implement comprehensive user management features including password change functionality.

## 🔧 BACKEND API DETAILS
- **Base URL**: `https://staykaru-backend-60ed08adb2a7.herokuapp.com`
- **Version**: v34 (Latest)
- **Authentication**: JWT Bearer Token
- **Status**: ✅ Deployed and ready for integration

## 🔐 AUTHENTICATION ENDPOINTS

### 1. User Registration
- **Endpoint**: `POST /auth/register`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "student", // Options: "student", "landlord", "food_provider"
  "phone": "+92123456789",
  "gender": "male" // Options: "male", "female"
}
```
- **Success Response (201)**:
```json
{
  "message": "Registration successful",
  "user": {
    "id": "userId123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student"
  }
}
```
- **Error Responses**: 400 (Email already exists)

### 2. User Login
- **Endpoint**: `POST /auth/login`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```
- **Success Response (200)**:
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "userId123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "phone": "+92123456789",
    "gender": "male"
  }
}
```
- **Error Responses**: 401 (Invalid credentials)

### 3. Get User Profile
- **Endpoint**: `GET /auth/profile`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Success Response (200)**:
```json
{
  "user": {
    "id": "userId123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "phone": "+92123456789",
    "gender": "male",
    "address": "123 Main St",
    "createdAt": "2025-06-18T07:55:43.413Z",
    "updatedAt": "2025-06-18T07:55:43.413Z"
  }
}
```

## 👤 USER MANAGEMENT ENDPOINTS

### 4. Update User Profile
- **Endpoint**: `PUT /users/profile`
- **Headers**: `Authorization: Bearer <jwt_token>`, `Content-Type: application/json`
- **Request Body** (all fields optional):
```json
{
  "name": "John Updated",
  "phone": "+92987654321",
  "address": "456 New Street, Lahore, Pakistan",
  "gender": "male"
}
```
- **Success Response (200)**:
```json
{
  "id": "userId123",
  "name": "John Updated",
  "email": "john.doe@example.com",
  "role": "student",
  "phone": "+92987654321",
  "address": "456 New Street, Lahore, Pakistan",
  "gender": "male",
  "updatedAt": "2025-06-18T08:30:15.123Z"
}
```

### 5. Change Password 🆕
- **Endpoint**: `POST /users/change-password`
- **Headers**: `Authorization: Bearer <jwt_token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newSecurePassword456"
}
```
- **Success Response (200)**:
```json
{
  "message": "Password changed successfully",
  "user": {
    "id": "userId123",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```
- **Error Responses**: 
  - 400 (Old password incorrect)
  - 400 (New password validation failed)
  - 401 (Unauthorized)

## 🔒 ADMIN ACCESS
- **Email**: `assaleemofficial@gmail.com`
- **Password**: `Sarim786`
- **Role**: `admin` (auto-assigned)
- **Special**: Only this specific email can access admin features

## 📱 REQUIRED FRONTEND IMPLEMENTATIONS

### A. Authentication Context Updates
```javascript
// Update AuthContext.js to use JWT instead of Firebase
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Store token in AsyncStorage
  const storeToken = async (token) => {
    await AsyncStorage.setItem('jwt_token', token);
    setToken(token);
  };

  // Get stored token
  const getStoredToken = async () => {
    const storedToken = await AsyncStorage.getItem('jwt_token');
    return storedToken;
  };

  // Login function
  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    await storeToken(access_token);
    setUser(user);
    return response.data;
  };

  // Register function
  const register = async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  };

  // Logout function
  const logout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  };

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = await getStoredToken();
      if (storedToken) {
        try {
          const response = await apiClient.get('/auth/profile', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error) {
          // Token invalid, clear storage
          await logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, login, register, logout, loading,
      updateProfile, changePassword // New functions
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### B. API Client Updates
```javascript
// Update apiClient.js for JWT authentication
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to all requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await AsyncStorage.removeItem('jwt_token');
      // Redirect to login screen
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### C. New Profile Management Screen
```javascript
// Create ProfileScreen.js with password change functionality
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const ProfileScreen = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      const response = await apiClient.put('/users/profile', formData);
      Alert.alert('Success', 'Profile updated successfully');
      updateProfile(response.data); // Update context
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    try {
      await apiClient.post('/users/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      
      Alert.alert('Success', 'Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Update Form */}
      <Text style={styles.title}>Profile Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(text) => setFormData({...formData, name: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phone}
        onChangeText={(text) => setFormData({...formData, phone: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={formData.address}
        onChangeText={(text) => setFormData({...formData, address: text})}
        multiline
      />
      
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>

      {/* Password Change Section */}
      <TouchableOpacity 
        style={styles.changePasswordButton}
        onPress={() => setShowPasswordChange(!showPasswordChange)}
      >
        <Text style={styles.changePasswordText}>Change Password</Text>
      </TouchableOpacity>

      {showPasswordChange && (
        <View style={styles.passwordSection}>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            value={passwordData.oldPassword}
            onChangeText={(text) => setPasswordData({...passwordData, oldPassword: text})}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={passwordData.newPassword}
            onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            value={passwordData.confirmPassword}
            onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
```

### D. Login Screen Updates
```javascript
// Update LoginScreen.js for JWT authentication
const LoginScreen = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      // Navigation will be handled by AuthContext state change
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Add admin login quick access for testing
  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      await login('assaleemofficial@gmail.com', 'Sarim786');
    } catch (error) {
      Alert.alert('Admin Login Failed', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Regular login form */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({...formData, email: text})}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({...formData, password: text})}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* Admin quick access button (for testing) */}
      <TouchableOpacity style={styles.adminButton} onPress={handleAdminLogin}>
        <Text style={styles.adminButtonText}>Admin Login</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### E. Registration Screen Updates
```javascript
// Update RegistrationScreen.js
const RegistrationScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: 'male',
    role: 'student'
  });

  const handleRegister = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const response = await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        role: formData.role
      });

      Alert.alert('Success', 'Registration successful! Please login.');
      // Navigate to login screen
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      {/* Form fields for all required data */}
      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={formData.name}
        onChangeText={(text) => setFormData({...formData, name: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={formData.email}
        onChangeText={(text) => setFormData({...formData, email: text})}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        value={formData.phone}
        onChangeText={(text) => setFormData({...formData, phone: text})}
        keyboardType="phone-pad"
      />
      
      {/* Gender and Role pickers */}
      {/* Password fields */}
      
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## 🔄 MIGRATION CHECKLIST

### ✅ REMOVE Firebase Dependencies
- [ ] Remove Firebase SDK and configuration
- [ ] Remove Firebase Auth imports and usage
- [ ] Update package.json to remove Firebase dependencies
- [ ] Remove Firebase-specific code from AuthContext

### ✅ IMPLEMENT JWT Authentication
- [ ] Update AuthContext for JWT token management
- [ ] Implement token storage using AsyncStorage
- [ ] Add JWT token to API requests
- [ ] Handle token expiration and refresh

### ✅ CREATE New Screens/Components
- [ ] Enhanced ProfileScreen with update functionality
- [ ] Password change component within ProfileScreen
- [ ] Updated LoginScreen for JWT
- [ ] Updated RegistrationScreen with all required fields

### ✅ UPDATE Existing Features
- [ ] Update all API calls to use new JWT endpoints
- [ ] Update navigation based on JWT authentication state
- [ ] Update user role handling for admin features
- [ ] Test all protected routes with JWT tokens

### ✅ TESTING Requirements
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Test admin login specifically
- [ ] Test profile updates
- [ ] Test password change functionality
- [ ] Test token expiration handling
- [ ] Test offline/online scenarios

## 🚨 IMPORTANT NOTES

1. **Admin Access**: Only `assaleemofficial@gmail.com` can access admin features
2. **Password Security**: All passwords are hashed with bcrypt on backend
3. **Token Management**: Implement proper token refresh or re-login on expiration
4. **Error Handling**: Implement comprehensive error handling for all API calls
5. **Validation**: Add client-side validation for all forms
6. **Loading States**: Implement loading indicators for all async operations

## 🎯 SUCCESS CRITERIA
- [ ] Users can register, login, and manage profiles
- [ ] Password change works seamlessly from profile screen
- [ ] Admin login works with special privileges
- [ ] All authentication flows are secure and user-friendly
- [ ] App handles network errors and token expiration gracefully
- [ ] UI/UX matches the existing app design language

## 📞 BACKEND SUPPORT
If you encounter any issues with the backend endpoints or need additional functionality, the backend is fully deployed and tested. All endpoints listed above are working correctly as of version v34.

---

**This prompt provides everything needed to implement the complete JWT authentication system with password management features. Focus on implementing these features one by one, testing thoroughly at each step.**
