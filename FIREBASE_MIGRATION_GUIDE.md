# Firebase Authentication Migration Guide

This document outlines the steps needed to fully migrate from Supabase to Firebase for authentication in the StayKaru backend.

## Migration Steps

### 1. Firebase Project Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication and select Email/Password as a sign-in method
3. Optionally, enable Phone Authentication if you need 2FA features
4. Generate a new private key for Admin SDK:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

### 2. Environment Variables

Add the following environment variables to your development environment and Heroku:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key" 
FIREBASE_API_KEY=your-web-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
```

Note: When adding the private key to Heroku, make sure to preserve newlines. Use:
```
heroku config:set FIREBASE_PRIVATE_KEY="$(cat path/to/your/firebase-key.json | jq -r '.private_key')"
```

### 3. Backend Code Migration

The following files have been updated:

- `src/config/firebase.config.ts` - Firebase configuration
- `src/modules/auth/services/firebase.service.ts` - Firebase service for authentication
- `src/modules/auth/auth.module.ts` - Updated to include FirebaseService
- `src/modules/auth/guards/auth.guard.ts` - Updated to use Firebase token verification
- `src/modules/auth/services/auth.service.ts` - Completely refactored to use Firebase
- `src/modules/user/schema/user.schema.ts` - Added firebaseUid field
- `src/modules/user/services/user.service.ts` - Added methods to work with Firebase UIDs
- `src/main.ts` - Added CORS configuration for Firebase client auth

### 4. User Data Migration

Run the migration script to transfer existing users from Supabase to Firebase:

```bash
npx ts-node migration-script.ts
```

Note: This script will:
1. Find all users with a Supabase ID but no Firebase UID
2. Check if they already exist in Firebase by email
3. If they exist, link their record in our database
4. If they don't exist, create a new Firebase user with a random password
5. Update our database with the Firebase UID

### 5. Frontend Updates

The frontend code will need to be updated to use Firebase Authentication SDK instead of Supabase:

1. Install the Firebase SDK:
   ```bash
   npm install firebase
   ```

2. Initialize Firebase in your frontend app:
   ```javascript
   import { initializeApp } from "firebase/app";
   import { getAuth } from "firebase/auth";

   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
     // Add other config options as needed
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   ```

3. Update authentication functions to use Firebase:
   ```javascript
   import { 
     signInWithEmailAndPassword, 
     createUserWithEmailAndPassword,
     signOut,
     sendPasswordResetEmail 
   } from "firebase/auth";
   import { auth } from "./firebaseConfig";

   // Login
   const login = async (email, password) => {
     const userCredential = await signInWithEmailAndPassword(auth, email, password);
     return userCredential.user;
   };

   // Register
   const register = async (email, password) => {
     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
     return userCredential.user;
   };

   // Logout
   const logout = async () => {
     await signOut(auth);
   };

   // Get token for API requests
   const getToken = async () => {
     const currentUser = auth.currentUser;
     if (currentUser) {
       return currentUser.getIdToken();
     }
     return null;
   };
   ```

### 6. Testing

1. Test registration, login, and authentication flows
2. Verify protected routes are accessible with Firebase tokens
3. Check user roles and permissions are correctly applied
4. Test password reset functionality

### 7. Cleanup

After successful migration and testing:

1. Remove Supabase dependencies from package.json
2. Remove Supabase configuration and environment variables
3. Update documentation to reflect Firebase authentication usage

## Firebase Authentication Features

- **Custom Claims**: Used for storing user roles
- **ID Tokens**: JWT tokens that can be verified on the server
- **Auth State Persistence**: Firebase SDK handles token refresh automatically
- **Multi-factor Authentication**: Available via Phone Authentication
- **Password Reset**: Built-in functionality for password reset emails

## Troubleshooting

- **Token Verification Errors**: Ensure clock sync between servers and make sure private key is correctly formatted with newlines
- **CORS Issues**: The backend has been configured to allow requests from localhost:3000 and staykaru.tech domains
- **User Migration**: If users have issues logging in after migration, they may need to use the password reset feature
