# 🚀 Frontend Integration Testing Guide

## 📋 **Pre-Implementation Checklist**

### ✅ **1. Verify Backend Status**
```bash
# Test backend health
curl https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
```

### ✅ **2. Install Dependencies**
```bash
cd d:\FYP\staykaru-frontend
npm install @react-native-async-storage/async-storage @react-native-picker/picker @react-native-community/datetimepicker react-native-image-picker react-native-vector-icons
```

### ✅ **3. Setup Vector Icons (Android)**
Add to `android/app/build.gradle`:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### ✅ **4. Setup Permissions (iOS/Android)**
**iOS - Info.plist:**
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to upload profile pictures</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to upload profile pictures</string>
```

**Android - AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

---

## 🧪 **Testing Strategy**

### **Phase 1: Individual Component Testing**
1. **FormField Component** - Test validation, password visibility
2. **LoadingSpinner** - Test overlay and inline modes
3. **Image Upload** - Test camera/gallery selection
4. **Validation Service** - Test all validation rules

### **Phase 2: Screen Integration Testing**
1. **RegisterScreen** - Test form submission and validation
2. **EmailVerificationScreen** - Test OTP send/verify/resend
3. **LoginScreen** - Test login with verified users

### **Phase 3: End-to-End Flow Testing**
1. **Complete Registration Flow** - Register → Verify → Login
2. **Error Handling** - Invalid data, network errors
3. **Navigation Flow** - Between screens and dashboards

---

## 🔍 **Debug Testing Commands**

### **Test Registration Endpoint**
```powershell
$headers = @{
    'Content-Type' = 'application/json'
}

$body = @{
    name = "Test User"
    email = "testuser@example.com"
    password = "TestPassword123!"
    phone = "+92 300 1234567"
    cnic = "12345-1234567-1"
    dateOfBirth = "1995-01-01"
    role = "student"
    country = "Pakistan"
    city = "Karachi"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/register" -Method POST -Headers $headers -Body $body
```

### **Test Email Verification**
```powershell
$body = @{
    email = "testuser@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/send-verification" -Method POST -Headers $headers -Body $body
```

### **Test Login**
```powershell
$body = @{
    email = "testuser@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/login" -Method POST -Headers $headers -Body $body
```

---

## 🛠️ **Implementation Steps**

### **Step 1: Create Base Structure**
```bash
# Create directories
mkdir -p src/components src/services src/utils src/screens

# Create base files
touch src/components/FormField.js
touch src/components/LoadingSpinner.js
touch src/services/authService.js
touch src/services/validationService.js
touch src/services/imageService.js
touch src/utils/constants.js
touch src/utils/helpers.js
```

### **Step 2: Implement Services First**
1. Copy `authService.js` code
2. Copy `validationService.js` code
3. Copy `imageService.js` code
4. Test services independently

### **Step 3: Implement Components**
1. Copy `FormField.js` code
2. Copy `LoadingSpinner.js` code
3. Test components in isolation

### **Step 4: Implement Screens**
1. Copy `RegisterScreen.js` code
2. Copy `EmailVerificationScreen.js` code
3. Copy enhanced `LoginScreen.js` code

### **Step 5: Update Navigation**
1. Update `AppNavigator.js` with new screens
2. Add proper navigation flow
3. Test navigation between screens

---

## 🔧 **Common Issues & Solutions**

### **Issue 1: Vector Icons Not Showing**
```bash
# Android
cd android && ./gradlew clean && cd ..
npx react-native run-android

# iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

### **Issue 2: Image Picker Permissions**
- Ensure all permissions are added to manifests
- Test on physical device (permissions don't work in simulator)

### **Issue 3: Network Requests Failing**
- Check if backend is running: `https://staykaru-backend-60ed08adb2a7.herokuapp.com/api`
- Verify API endpoints in browser/Postman
- Check network security config for Android

### **Issue 4: AsyncStorage Issues**
```bash
# Clear cache
npx react-native start --reset-cache
```

---

## 📊 **Expected Results**

### **✅ Successful Registration Flow:**
1. User fills all required fields
2. Form validation passes
3. API call succeeds
4. User redirected to email verification
5. OTP sent to email
6. User enters correct OTP
7. Email verified successfully
8. User can now login

### **✅ Successful Login Flow:**
1. User enters email/password
2. Validation passes
3. API authentication succeeds
4. User redirected to appropriate dashboard based on role

### **✅ Error Handling:**
1. Form validation errors shown inline
2. Network errors handled gracefully
3. Backend validation errors displayed
4. Loading states prevent multiple submissions

---

## 🎯 **Performance Optimization**

### **Code Splitting**
- Lazy load screens that aren't immediately needed
- Use React.memo for form components

### **Image Optimization**
- Compress images before upload
- Use appropriate image formats
- Implement image caching

### **Network Optimization**
- Implement request caching
- Add retry logic for failed requests
- Use loading states to improve UX

This completes your comprehensive frontend implementation guide! 🚀
