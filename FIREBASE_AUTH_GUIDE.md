# Firebase Token-Based Authentication System

## 🚀 **Successfully Deployed!**
**API URL:** https://staykaru-backend-60ed08adb2a7.herokuapp.com/

## 📋 **Architecture Overview**

### **Frontend (React Native/Web)**
- Uses Firebase SDK for login/signup UI
- Receives Firebase ID tokens after authentication
- Sends tokens to backend API for verification
- No Firebase Admin operations on frontend

### **Backend (NestJS)**
- Receives Firebase ID tokens from frontend
- Verifies tokens using Firebase Admin SDK
- Manages user sessions and profiles
- Protects routes with token verification

## 🔑 **New Authentication Endpoints**

### **1. Verify Token**
```http
POST /auth/verify-token
Content-Type: application/json

{
  "token": "firebase-id-token-from-frontend"
}
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firebaseUid": "firebase-uid-123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "emailVerified": true
  },
  "firebaseData": {
    "uid": "firebase-uid-123",
    "email": "john@example.com",
    "emailVerified": true,
    "customClaims": { "role": "student" }
  }
}
```

### **2. Get Profile**
```http
POST /auth/profile
Content-Type: application/json

{
  "token": "firebase-id-token-from-frontend"
}
```

### **3. Refresh User Data**
```http
POST /auth/refresh
Content-Type: application/json

{
  "token": "firebase-id-token-from-frontend"
}
```

## 🛡️ **Protecting Routes with FirebaseAuthGuard**

### **Using the Guard**
```typescript
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('protected')
export class SomeController {
  
  @Get('data')
  @UseGuards(FirebaseAuthGuard)
  async getProtectedData(@Request() req) {
    // req.user contains verified user data
    const user = req.user;
    return { message: `Hello ${user.name}` };
  }
}
```

### **Authorization Header**
For protected routes, send:
```
Authorization: Bearer <firebase-id-token>
```

## 📱 **Frontend Integration Example**

### **React Native with Firebase**
```javascript
import auth from '@react-native-firebase/auth';

// After Firebase login
const user = auth().currentUser;
if (user) {
  const token = await user.getIdToken();
  
  // Send to your backend
  const response = await fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/auth/verify-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token })
  });
  
  const userData = await response.json();
  console.log(userData.user);
}
```

### **Web with Firebase**
```javascript
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken();
    
    // Verify with backend
    const response = await fetch('/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
  }
});
```

## 🔄 **Authentication Flow**

1. **Frontend:** User logs in using Firebase SDK
2. **Frontend:** Receives Firebase ID token
3. **Frontend:** Sends token to backend `/auth/verify-token`
4. **Backend:** Verifies token with Firebase Admin SDK
5. **Backend:** Returns user data from MongoDB
6. **Frontend:** Stores user data and uses for app state
7. **Frontend:** Includes token in `Authorization` header for protected requests

## ⚡ **Key Features**

- ✅ **Secure:** Firebase Admin SDK verification
- ✅ **Scalable:** Token-based stateless authentication
- ✅ **Flexible:** Works with any Firebase-compatible frontend
- ✅ **Fast:** Cached user data with encryption
- ✅ **Complete:** User roles, email verification, profile management

## 🔧 **Environment Variables Required**

Make sure these are set in Heroku:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

## 📝 **Next Steps for Frontend**

1. **Install Firebase SDK** in your React Native/Web app
2. **Implement login/signup** using Firebase Auth UI
3. **Get ID tokens** after successful authentication
4. **Send tokens to backend** for verification
5. **Store user data** from backend response
6. **Use tokens in headers** for protected API calls

Your Firebase authentication system is now fully functional and deployed! 🎉
