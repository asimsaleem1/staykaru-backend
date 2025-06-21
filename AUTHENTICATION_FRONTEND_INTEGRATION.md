# Authentication System Integration Guide

## Overview

This guide provides detailed instructions for implementing and integrating the updated authentication system into your existing frontend application. The authentication system has been enhanced with improved security, validation, and user experience.

## Backend API Endpoints

### Registration

```
POST /auth/register
```

**Required fields:**
- `name` (string): Full name of the user
- `email` (string): Valid email address
- `password` (string): Password (min 8 characters, including uppercase, lowercase, number, special character)
- `role` (string): User role ('student', 'landlord', 'food_provider', 'admin')
- `phone` (string): Phone number
- `countryCode` (string): Country code (e.g., '+1')
- `gender` (string): Gender

**Optional fields:**
- `address` (string): User's address

**Response:**
- Success (201): User created successfully
- Error (400): Validation errors or email already exists

### Login

```
POST /auth/login
```

**Required fields:**
- `email` (string): User's email
- `password` (string): User's password

**Response:**
- Success (200): Returns JWT token and user information
- Error (401): Invalid credentials

### Password Reset

```
POST /auth/forgot-password
```

**Required fields:**
- `email` (string): User's email

**Response:**
- Success (200): Password reset link sent
- Error (404): Email not found

```
POST /auth/reset-password
```

**Required fields:**
- `token` (string): Reset token
- `password` (string): New password

**Response:**
- Success (200): Password updated
- Error (400): Invalid token or password

### Social Authentication

```
POST /auth/social-login
```

**Required fields:**
- `provider` (string): Social provider name ('google' or 'facebook')
- `token` (string): Access token received from the social provider
- `role` (string, optional): User role if it's a new registration ('student', 'landlord', 'food_provider')

**Response:**
- Success (200): Returns JWT token and user information
- Success (201): If new user is created, returns JWT token and user information
- Error (400): Invalid token or missing required fields

## Implementation Steps

### 1. Form Validation

Implement comprehensive client-side validation:

```jsx
// Example using Formik and Yup
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain an uppercase letter')
    .matches(/[a-z]/, 'Password must contain a lowercase letter')
    .matches(/[0-9]/, 'Password must contain a number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['student', 'landlord', 'food_provider'], 'Invalid role'),
  phone: Yup.string()
    .required('Phone number is required'),
  countryCode: Yup.string()
    .required('Country code is required'),
  gender: Yup.string()
    .required('Gender is required')
});
```

### 2. Authentication Service

Create a service to handle API calls:

```jsx
// authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/auth';

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, password });
  return response.data;
};

const socialLogin = async (provider, token, role = null) => {
  const response = await axios.post(`${API_URL}/social-login`, {
    provider,
    token,
    role
  });
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

export default {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  socialLogin
};
```

### 3. Authentication Context

Create a context to manage authentication state:

```jsx
// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const socialLogin = async (provider, token, role = null) => {
    const response = await authService.socialLogin(provider, token, role);
    setUser(response);
    return response;
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const getUserRole = () => {
    return user ? user.role : null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        socialLogin,
        isAuthenticated,
        getUserRole,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. Protected Routes

Create a component to handle protected routes:

```jsx
// ProtectedRoute.js
import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const { isAuthenticated, getUserRole, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated()) {
          return <Navigate to="/login" />;
        }

        if (allowedRoles && !allowedRoles.includes(getUserRole())) {
          return <Navigate to="/unauthorized" />;
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;
```

### 5. Registration Form Component

```jsx
// RegisterForm.js
import React, { useState, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [apiError, setApiError] = useState(null);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const initialValues = {
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    countryCode: '+1',
    gender: '',
    address: ''
  };

  const validationSchema = Yup.object({
    // Validation schema as defined earlier
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      await register(values);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Registration failed');
      } else {
        setApiError('Something went wrong. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-form">
      <h2>Create an Account</h2>
      {apiError && <div className="alert alert-danger">{apiError}</div>}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <Field type="text" name="name" className="form-control" />
              <ErrorMessage name="name" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <Field type="email" name="email" className="form-control" />
              <ErrorMessage name="email" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Field type="password" name="password" className="form-control" />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <Field as="select" name="role" className="form-control">
                <option value="student">Student</option>
                <option value="landlord">Landlord</option>
                <option value="food_provider">Food Provider</option>
              </Field>
              <ErrorMessage name="role" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="countryCode">Country Code</label>
              <Field as="select" name="countryCode" className="form-control">
                <option value="+1">+1 (US/Canada)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (India)</option>
                {/* Add more country codes as needed */}
              </Field>
              <ErrorMessage name="countryCode" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <Field type="text" name="phone" className="form-control" />
              <ErrorMessage name="phone" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <Field as="select" name="gender" className="form-control">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Field>
              <ErrorMessage name="gender" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address (Optional)</label>
              <Field as="textarea" name="address" className="form-control" />
              <ErrorMessage name="address" component="div" className="text-danger" />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </Form>
        )}
      </Formik>
      <div className="mt-3">
        Already have an account? <a href="/login">Login here</a>
      </div>
    </div>
  );
};

export default RegisterForm;
```

### 6. Login Form Component

```jsx
// LoginForm.js
import React, { useState, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';
import FacebookLoginButton from './FacebookLoginButton';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../config/oauthConfig';

const LoginForm = () => {
  const [apiError, setApiError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const initialValues = {
    email: '',
    password: '',
    rememberMe: false
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      const userData = await login(values.email, values.password);
      
      // Role-based redirection
      switch(userData.role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'landlord':
          navigate('/landlord/dashboard');
          break;
        case 'food_provider':
          navigate('/food-provider/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Login failed');
      } else {
        setApiError('Something went wrong. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialError = (errorMessage) => {
    setApiError(errorMessage);
  };

  return (
    <div className="login-form">
      <h2>Login to Your Account</h2>
      {location.state && location.state.message && (
        <div className="alert alert-success">{location.state.message}</div>
      )}
      {apiError && <div className="alert alert-danger">{apiError}</div>}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <Field type="email" name="email" className="form-control" />
              <ErrorMessage name="email" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Field type="password" name="password" className="form-control" />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>

            <div className="form-check">
              <Field type="checkbox" name="rememberMe" className="form-check-input" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-3 w-100"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>

      <div className="social-login-divider">
        <span>OR</span>
      </div>

      <div className="social-login-buttons">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleLoginButton onError={handleSocialError} />
        </GoogleOAuthProvider>
        <FacebookLoginButton onError={handleSocialError} />
      </div>

      <div className="mt-3">
        <a href="/forgot-password">Forgot password?</a>
      </div>
      <div className="mt-2">
        Don't have an account? <a href="/register">Register here</a>
      </div>
    </div>
  );
};

export default LoginForm;
```

### 7. Forgot Password Component

```jsx
// ForgotPassword.js
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  const initialValues = {
    email: ''
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      await authService.forgotPassword(values.email);
      setSuccess(true);
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Failed to send reset link');
      } else {
        setApiError('Something went wrong. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-form">
      <h2>Forgot Password</h2>
      {success ? (
        <div className="alert alert-success">
          Password reset link has been sent to your email if an account exists with that email.
        </div>
      ) : (
        <>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
          {apiError && <div className="alert alert-danger">{apiError}</div>}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, isValid }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <Field type="email" name="email" className="form-control" />
                  <ErrorMessage name="email" component="div" className="text-danger" />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary mt-3"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </Form>
            )}
          </Formik>
        </>
      )}
      <div className="mt-3">
        <a href="/login">Back to Login</a>
      </div>
    </div>
  );
};

export default ForgotPassword;
```

### 8. Reset Password Component

```jsx
// ResetPassword.js
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ResetPassword = () => {
  const [apiError, setApiError] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  const initialValues = {
    password: '',
    confirmPassword: ''
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain an uppercase letter')
      .matches(/[a-z]/, 'Password must contain a lowercase letter')
      .matches(/[0-9]/, 'Password must contain a number')
      .matches(/[^A-Za-z0-9]/, 'Password must contain a special character'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      await authService.resetPassword(token, values.password);
      navigate('/login', { state: { message: 'Password reset successful! You can now login with your new password.' } });
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Failed to reset password');
      } else {
        setApiError('Something went wrong. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reset-password-form">
      <h2>Reset Password</h2>
      {apiError && <div className="alert alert-danger">{apiError}</div>}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <Field type="password" name="password" className="form-control" />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <Field type="password" name="confirmPassword" className="form-control" />
              <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ResetPassword;
```

### 9. Route Configuration

```jsx
// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import StudentDashboard from './components/student/Dashboard';
import LandlordDashboard from './components/landlord/Dashboard';
import FoodProviderDashboard from './components/food-provider/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import Unauthorized from './components/Unauthorized';
import NotFound from './components/NotFound';
import SocialSignupCompletion from './components/SocialSignupCompletion';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/complete-social-signup" element={<SocialSignupCompletion />} />
            
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute 
                  component={StudentDashboard} 
                  allowedRoles={['student']} 
                />
              } 
            />
            
            <Route 
              path="/landlord/dashboard" 
              element={
                <ProtectedRoute 
                  component={LandlordDashboard} 
                  allowedRoles={['landlord']} 
                />
              } 
            />
            
            <Route 
              path="/food-provider/dashboard" 
              element={
                <ProtectedRoute 
                  component={FoodProviderDashboard} 
                  allowedRoles={['food_provider']} 
                />
              } 
            />
            
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute 
                  component={AdminDashboard} 
                  allowedRoles={['admin']} 
                />
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Integration Checklist

Use this checklist to ensure all aspects of the authentication system are properly implemented:

- [ ] API Services
  - [ ] Register endpoint
  - [ ] Login endpoint
  - [ ] Forgot password endpoint
  - [ ] Reset password endpoint
  - [ ] Error handling

- [ ] Authentication Context
  - [ ] User state management
  - [ ] Login/logout functions
  - [ ] Role-based access control

- [ ] Form Components
  - [ ] Registration form
  - [ ] Login form
  - [ ] Forgot password form
  - [ ] Reset password form
  - [ ] Form validation
  - [ ] Loading states
  - [ ] Error messages
  - [ ] Success feedback

- [ ] Routing
  - [ ] Protected routes
  - [ ] Role-based route protection
  - [ ] Redirect after login/registration
  - [ ] Unauthorized page

- [ ] User Experience
  - [ ] Consistent styling
  - [ ] Responsive design
  - [ ] Accessibility features
  - [ ] Clear user feedback

## Security Best Practices

1. **Token Storage**: Store JWT tokens in HttpOnly cookies if possible, or use secure localStorage with additional protections
2. **Input Validation**: Validate all user inputs both client-side and server-side
3. **HTTPS**: Ensure all API calls use HTTPS
4. **Token Expiration**: Implement proper token expiration and refresh strategies
5. **Error Messages**: Use generic error messages that don't reveal sensitive information
6. **Rate Limiting**: Implement rate limiting for authentication attempts to prevent brute force attacks
7. **Content Security Policy**: Implement CSP to prevent XSS attacks

## Conclusion

This guide provides a comprehensive approach to implementing a secure and user-friendly authentication system for your application. By following these steps and best practices, you can create a robust authentication experience that protects user data while providing a seamless user experience.

## CSS Styling for Social Buttons

Add these styles to make your social login buttons look good:

```css
/* Social Login Styles */
.social-login-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}

.social-login-divider::before,
.social-login-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.social-login-divider span {
  padding: 0 10px;
  color: #777;
  font-size: 14px;
}

.social-login-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.facebook-login-button button {
  background-color: #4267B2;
  color: white;
  border: none;
}

.google-login-button button {
  background-color: white;
  color: #444;
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.facebook-login-button button:hover {
  background-color: #365899;
}

.google-login-button button:hover {
  background-color: #f8f8f8;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
```

## Role-Based Redirection for Social Login

### Default Student Role for Social Login

For your specific use case, you should redirect social login users (Google and Facebook) directly to the student screens and modules by default. Here's how to implement this functionality:

### 1. Update the Social Login Backend Endpoint

In your backend, modify the social login endpoint to default to the student role when a new user registers through social authentication:

```javascript
// Backend pseudocode (Node.js/Express)
app.post('/auth/social-login', async (req, res) => {
  const { provider, token } = req.body;
  
  try {
    // Verify token with social provider
    const socialUserInfo = await verifySocialToken(provider, token);
    
    // Check if user exists
    let user = await User.findOne({ email: socialUserInfo.email });
    
    if (!user) {
      // Create new user with default STUDENT role
      user = new User({
        name: socialUserInfo.name,
        email: socialUserInfo.email,
        role: 'student', // Default to student role
        [provider + 'Id']: socialUserInfo.id,
        socialProvider: provider,
        isEmailVerified: true, // Email is verified by social provider
        // Set default values for required fields
        phone: '',
        countryCode: '',
        gender: ''
      });
      
      await user.save();
    }
    
    // Generate JWT token
    const token = generateJwtToken(user);
    
    // Return user data and token
    res.status(user.phone ? 200 : 201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: Boolean(user.phone) // Check if profile is complete
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid social token' });
  }
});
```

### 2. Update Frontend Social Login Handlers

Modify your frontend social login handlers to automatically redirect to student screens:

#### Google Login Component

```jsx
// GoogleLoginButton.js
import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GOOGLE_CLIENT_ID } from '../config/oauthConfig';

const GoogleLoginButton = ({ onError }) => {
  const { socialLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      const userData = await socialLogin('google', response.credential);
      
      // Check if profile is complete
      if (!userData.isProfileComplete) {
        // Redirect to complete profile page if needed
        navigate('/complete-social-signup', {
          state: { provider: 'google', token: response.credential }
        });
        return;
      }
      
      // Always redirect to student dashboard regardless of role
      navigate('/student/dashboard');
    } catch (error) {
      onError(error.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={(error) => onError('Google login failed')}
      logo="google"
    />
  );
};

export default GoogleLoginButton;
```

#### Facebook Login Component

```jsx
// FacebookLoginButton.js
import React, { useContext } from 'react';
import FacebookLogin from 'react-facebook-login';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FACEBOOK_APP_ID } from '../config/oauthConfig';

const FacebookLoginButton = ({ onError }) => {
  const { socialLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleResponse = async (response) => {
    if (response.accessToken) {
      try {
        const userData = await socialLogin('facebook', response.accessToken);
        
        // Check if profile is complete
        if (!userData.isProfileComplete) {
          // Redirect to complete profile page if needed
          navigate('/complete-social-signup', {
            state: { provider: 'facebook', token: response.accessToken }
          });
          return;
        }
        
        // Always redirect to student dashboard regardless of role
        navigate('/student/dashboard');
      } catch (error) {
        onError(error.response?.data?.message || 'Facebook login failed');
      }
    } else {
      onError('Facebook login failed. Please try again.');
    }
  };

  return (
    <FacebookLogin
      appId={FACEBOOK_APP_ID}
      autoLoad={false}
      fields="name,email,picture"
      callback={handleResponse}
      onError={() => onError('Facebook login failed')}
      cssClass="btn btn-primary w-100"
      icon="fa-facebook"
    />
  );
};

export default FacebookLoginButton;
```

### 3. Update Profile Completion Component

Modify the profile completion component to always set the role to student and redirect to student dashboard:

```jsx
// SocialSignupCompletion.js
import React, { useState, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SocialSignupCompletion = () => {
  const [apiError, setApiError] = useState(null);
  const { socialLogin } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from location state passed from social login
  const { provider, token } = location.state || {};

  const initialValues = {
    // Pre-set role to student and hide role selection
    role: 'student',
    phone: '',
    countryCode: '+1',
    gender: '',
    address: ''
  };

  const validationSchema = Yup.object({
    phone: Yup.string()
      .required('Phone number is required'),
    countryCode: Yup.string()
      .required('Country code is required'),
    gender: Yup.string()
      .required('Gender is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      await socialLogin(provider, token, {
        role: 'student', // Always set to student
        phone: values.phone,
        countryCode: values.countryCode,
        gender: values.gender,
        address: values.address
      });
      
      // Always redirect to student dashboard
      navigate('/student/dashboard');
    } catch (error) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Registration failed');
      } else {
        setApiError('Something went wrong. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="social-signup-completion">
      <h2>Complete Your Profile</h2>
      <p>Please provide the following information to complete your student account.</p>
      {apiError && <div className="alert alert-danger">{apiError}</div>}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid }) => (
          <Form>
            {/* Role field is removed since we're always setting it to student */}
            
            <div className="form-group">
              <label htmlFor="countryCode">Country Code</label>
              <Field as="select" name="countryCode" className="form-control">
                <option value="+1">+1 (US/Canada)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (India)</option>
                {/* Add more country codes as needed */}
              </Field>
              <ErrorMessage name="countryCode" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <Field type="text" name="phone" className="form-control" />
              <ErrorMessage name="phone" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <Field as="select" name="gender" className="form-control">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Field>
              <ErrorMessage name="gender" component="div" className="text-danger" />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address (Optional)</label>
              <Field as="textarea" name="address" className="form-control" />
              <ErrorMessage name="address" component="div" className="text-danger" />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? 'Completing Registration...' : 'Complete Registration'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SocialSignupCompletion;
```

### 4. Update Auth Context

Make sure your auth context properly handles the student-only redirection for social login:

```jsx
// AuthContext.js
// ...existing imports...

export const AuthProvider = ({ children }) => {
  // ...existing code...

  const socialLogin = async (provider, token, additionalInfo = null) => {
    try {
      const response = await authService.socialLogin(provider, token, additionalInfo);
      setUser({
        ...response,
        role: 'student' // Ensure role is set to student
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // ...rest of the context provider...
};
```

### 5. Update Login and Register Components

In your main login and register components, make sure social logins also redirect to student dashboard:

```jsx
// In LoginForm.js and RegisterForm.js where you handle social login callbacks
const handleSocialSuccess = (userData) => {
  // Always redirect to student dashboard for social logins
  navigate('/student/dashboard');
};
```

### 6. Student Modules Access

Ensure that once redirected to the student dashboard, the user has access to all student modules:

```jsx
// StudentDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import studentService from '../services/studentService';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await studentService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="student-dashboard">
      <h1>Welcome to Your Student Dashboard</h1>
      
      <div className="dashboard-summary">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Bookings</h5>
            <p className="card-text">Active Bookings: {dashboardData?.activeBookings || 0}</p>
            <Link to="/student/bookings" className="btn btn-primary">View Bookings</Link>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Food Orders</h5>
            <p className="card-text">Pending Orders: {dashboardData?.pendingOrders || 0}</p>
            <Link to="/student/orders" className="btn btn-primary">View Orders</Link>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Notifications</h5>
            <p className="card-text">Unread: {dashboardData?.unreadNotifications || 0}</p>
            <Link to="/student/notifications" className="btn btn-primary">View Notifications</Link>
          </div>
        </div>
      </div>
      
      <div className="module-access">
        <h3>Quick Access</h3>
        <div className="module-grid">
          <Link to="/student/accommodations" className="module-card">
            <i className="fas fa-home"></i>
            <span>Find Accommodation</span>
          </Link>
          
          <Link to="/student/food" className="module-card">
            <i className="fas fa-utensils"></i>
            <span>Order Food</span>
          </Link>
          
          <Link to="/student/profile" className="module-card">
            <i className="fas fa-user"></i>
            <span>My Profile</span>
          </Link>
          
          <Link to="/student/payments" className="module-card">
            <i className="fas fa-credit-card"></i>
            <span>Payment History</span>
          </Link>
          
          <Link to="/student/reviews" className="module-card">
            <i className="fas fa-star"></i>
            <span>My Reviews</span>
          </Link>
          
          <Link to="/student/help" className="module-card">
            <i className="fas fa-question-circle"></i>
            <span>Help & Support</span>
          </Link>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        {dashboardData?.recentActivities?.length > 0 ? (
          <ul className="activity-list">
            {dashboardData.recentActivities.map((activity, index) => (
              <li key={index} className="activity-item">
                <span className="activity-time">{new Date(activity.timestamp).toLocaleString()}</span>
                <span className="activity-description">{activity.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activities</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
```

### 7. CSS for Student Dashboard

Add these styles to make your student dashboard look good:

```css
/* Student Dashboard Styles */
.student-dashboard {
  padding: 20px;
}

.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard-summary .card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.dashboard-summary .card:hover {
  transform: translateY(-5px);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.module-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  color: #333;
}

.module-card:hover {
  background-color: #e9ecef;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.module-card i {
  font-size: 24px;
  margin-bottom: 10px;
  color: #007bff;
}

.activity-list {
  list-style: none;
  padding: 0;
}

.activity-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.activity-time {
  font-size: 0.85rem;
  color: #6c757d;
  margin-right: 10px;
  min-width: 150px;
}

.activity-description {
  flex: 1;
}

@media (max-width: 768px) {
  .dashboard-summary {
    grid-template-columns: 1fr;
  }
  
  .module-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .activity-time {
    margin-bottom: 5px;
  }
}
```
