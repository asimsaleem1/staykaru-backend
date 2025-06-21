# Social Login Setup Guide

This guide will help you configure Google and Facebook OAuth for real social login testing with your mobile app.

## Prerequisites

The following packages have been installed:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `passport-facebook` - Facebook OAuth strategy
- `@types/passport` - TypeScript definitions
- `@types/passport-google-oauth20` - TypeScript definitions
- `@types/passport-facebook` - TypeScript definitions

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API or Google People API

### 1.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. Select **Web application** as application type
4. Add these redirect URIs:
   ```
   http://localhost:3000/auth/google/callback
   https://yourdomain.com/auth/google/callback
   ```
5. Copy the **Client ID** and **Client Secret**

### 1.3 Configure for Mobile
For mobile app testing, you'll also need:
1. Create another OAuth client for **Android** or **iOS**
2. Add your app's package name and SHA-1 fingerprint (Android)
3. Add your bundle ID (iOS)

## Step 2: Facebook OAuth Setup

### 2.1 Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Consumer** app type
4. Enter app name and contact email

### 2.2 Configure Facebook Login
1. In your app dashboard, go to **Products** > **Facebook Login**
2. Click **Settings** under Facebook Login
3. Add these Valid OAuth Redirect URIs:
   ```
   http://localhost:3000/auth/facebook/callback
   https://yourdomain.com/auth/facebook/callback
   ```

### 2.3 Get App Credentials
1. Go to **Settings** > **Basic**
2. Copy the **App ID** and **App Secret**

## Step 3: Environment Configuration

### 3.1 Create .env file
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3.2 Add OAuth Credentials
Update your `.env` file with your OAuth credentials:

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
FACEBOOK_APP_ID=your_actual_facebook_app_id
FACEBOOK_APP_SECRET=your_actual_facebook_app_secret
```

## Step 4: Mobile App Configuration

### 4.1 For React Native/Expo
If you're using React Native or Expo, install these packages in your frontend:

```bash
npm install expo-auth-session expo-web-browser
# or
npm install @react-native-async-storage/async-storage react-native-app-auth
```

### 4.2 Configure OAuth in Mobile App
Update your mobile app configuration with the OAuth client IDs:

```javascript
const GOOGLE_CONFIG = {
  clientId: 'your_google_client_id.apps.googleusercontent.com',
  // For Android
  androidClientId: 'your_android_client_id.apps.googleusercontent.com',
  // For iOS  
  iosClientId: 'your_ios_client_id.apps.googleusercontent.com',
};

const FACEBOOK_CONFIG = {
  appId: 'your_facebook_app_id',
};
```

## Step 5: Testing the Implementation

### 5.1 API Endpoints Available
Your backend now supports these endpoints:

```
POST /auth/social-login
Body: {
  "provider": "google",
  "token": "google_id_token_from_mobile",
  "role": "student|landlord|food_provider"
}

POST /auth/social-login  
Body: {
  "provider": "facebook",
  "token": "facebook_access_token_from_mobile", 
  "role": "student|landlord|food_provider"
}
```

### 5.2 Mobile App Flow
1. User taps Google/Facebook login button
2. Mobile app opens OAuth flow
3. User logs in with their account
4. Mobile app receives OAuth token
5. Mobile app sends token to your backend `/auth/social-login` endpoint
6. Backend verifies token with Google/Facebook
7. Backend creates/updates user and returns JWT

### 5.3 Test with Real Accounts
You can now test with:
- Your real Google account
- Your real Facebook account
- Any test accounts you create

## Step 6: Security Considerations

### 6.1 Production Settings
For production:
1. Use HTTPS only
2. Update redirect URIs to production domains
3. Enable additional security features in OAuth consoles
4. Store secrets securely (environment variables, not in code)

### 6.2 Token Validation
The backend automatically:
- Verifies tokens with Google/Facebook APIs
- Validates token belongs to your app
- Extracts user information securely
- Creates secure JWT tokens for your app

## Troubleshooting

### Common Issues:
1. **Invalid OAuth credentials**: Check client IDs and secrets
2. **Redirect URI mismatch**: Ensure URIs match exactly in OAuth console
3. **Token verification failed**: Check if tokens are fresh and valid
4. **CORS issues**: Add proper CORS configuration for your domain

### Debug Steps:
1. Check backend logs for detailed error messages
2. Verify environment variables are loaded
3. Test OAuth tokens manually with provider APIs
4. Ensure mobile app is sending correct token format

## Need Help?

The social login system is now ready for testing with real accounts. The backend will:
- Accept real OAuth tokens from your mobile app
- Verify them with Google/Facebook
- Handle user registration/login automatically
- Support role-based authentication (student/landlord/food_provider)

Contact the development team if you need help with:
- OAuth console configuration
- Mobile app integration
- Token debugging
- Production deployment
