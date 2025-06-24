# 🚀 StayKaru Frontend Development Guide

## 📋 Backend Status: **PRODUCTION READY** ✅

The StayKaru backend is fully deployed and operational with a massive dataset ready for frontend integration.

## 🌐 Production API Details

### Base URL
```
https://staykaru-backend-60ed08adb2a7.herokuapp.com
```

### API Documentation
```
https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/docs
```

## 📊 Available Data

### 🏨 Accommodations (1,151 items)
- **Islamabad**: 390 accommodations
- **Lahore**: 473 accommodations  
- **Karachi**: 288 accommodations

Each accommodation includes:
- Title, description, pricing
- Geographic coordinates (lat/lng)
- Amenities list
- Host information
- Multiple images
- Ratings and reviews

### 🍽️ Food Service (10,967+ restaurants)
- **Pakistani Restaurants**: 10,967 real restaurants
- **Menu Items**: 97,275+ items
- **Active Providers**: 32 with full details

Each restaurant includes:
- Name, cuisine type, location
- Menu items with pricing
- Contact information
- Operating hours
- Ratings

## 🔐 Authentication System

### User Roles
1. **Student** - Browse accommodations and food, make bookings
2. **Landlord** - Manage accommodations, view bookings
3. **Food Provider** - Manage restaurants and menu items
4. **Admin** - Full system management

### Test Credentials
```javascript
// For development/testing
const TEST_USERS = {
  student: {
    email: 'student@staykaru.com',
    password: 'password123'
  },
  admin: {
    email: 'admin@staykaru.com', 
    password: 'admin123'
  },
  landlord: {
    email: 'landlord@staykaru.com',
    password: 'password123'
  },
  foodProvider: {
    email: 'foodprovider@staykaru.com',
    password: 'password123'
  }
};
```

## 📡 Core API Endpoints

### Authentication
```javascript
// Login
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: object }

// Register
POST /api/auth/register  
Body: { name: string, email: string, password: string, role: string }
```

### Accommodations
```javascript
// Get all accommodations
GET /api/accommodations
Response: Array of accommodation objects

// Get accommodation by ID
GET /api/accommodations/:id
Response: Single accommodation object

// Filter accommodations
GET /api/accommodations?minPrice=5000&maxPrice=15000
Response: Filtered accommodations
```

### Food Service
```javascript
// Get all food providers
GET /api/food-providers
Response: Array of restaurant objects

// Get food provider by ID
GET /api/food-providers/:id
Response: Single restaurant object

// Get all menu items
GET /api/menu-items
Response: Array of menu item objects
```

### AI Chatbot
```javascript
// Send message to chatbot
POST /api/chatbot/message
Body: { message: string, userId?: string }
Response: { response: string }

// Get chat suggestions
GET /api/chatbot/suggestions
Response: Array of suggestion strings
```

## 🎨 Frontend Implementation Strategy

### 1. Authentication Flow
```javascript
// Login function
async function login(email, password) {
  const response = await fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

// Authenticated requests
async function authenticatedRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  return fetch(`https://staykaru-backend-60ed08adb2a7.herokuapp.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}
```

### 2. Data Fetching Examples
```javascript
// Fetch accommodations
async function getAccommodations() {
  const response = await authenticatedRequest('/api/accommodations');
  return response.json();
}

// Fetch restaurants
async function getRestaurants() {
  const response = await authenticatedRequest('/api/food-providers');
  return response.json();
}

// Search accommodations
async function searchAccommodations(filters) {
  const query = new URLSearchParams(filters).toString();
  const response = await authenticatedRequest(`/api/accommodations?${query}`);
  return response.json();
}
```

### 3. Chatbot Integration
```javascript
// Chat with AI
async function sendChatMessage(message) {
  const response = await authenticatedRequest('/api/chatbot/message', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  return response.json();
}
```

## 🗺️ Geographic Integration

Each accommodation includes coordinates for map integration:
```javascript
// Example accommodation object
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Modern Student Apartment",
  "coordinates": {
    "type": "Point",
    "coordinates": [73.0479, 33.6844] // [longitude, latitude]
  },
  "city": {
    "name": "Islamabad",
    "state": "Islamabad Capital Territory"
  }
  // ... other fields
}
```

## 🎯 Recommended Frontend Features

### Essential Features
1. **User Authentication** - Login/Register/Profile
2. **Accommodation Listing** - Browse 1,151 accommodations
3. **Restaurant Listing** - Browse 10K+ restaurants  
4. **Search & Filters** - Price, location, amenities
5. **Detail Views** - Individual accommodation/restaurant pages
6. **Map Integration** - Show locations with coordinates
7. **AI Chatbot** - Help users find what they need

### Advanced Features
1. **Booking System** - Reserve accommodations
2. **Food Ordering** - Order from restaurants
3. **Reviews & Ratings** - User feedback system
4. **Favorites** - Save preferred items
5. **Notifications** - Booking confirmations, updates
6. **Dashboard** - User-specific management panels

## 🛠️ Development Tools

### Recommended Frontend Stack
- **React.js** or **Next.js** for the framework
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** or **SWR** for data fetching
- **Google Maps API** for location features
- **Socket.io** for real-time features

### API Testing Tools
```bash
# Test with curl
curl -X POST https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@staykaru.com","password":"password123"}'
```

## 📱 Mobile Considerations

The backend supports mobile development with:
- RESTful APIs suitable for React Native
- Image URLs for all accommodations and restaurants
- Geographic coordinates for native map integration
- JWT authentication for secure mobile sessions

## 🚨 Important Notes

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000` (development)
- `https://staykaru.tech` (production)
- `https://www.staykaru.tech` (production)

### Rate Limiting
- No current rate limiting implemented
- Suitable for development and moderate production use

### Error Handling
All API responses follow standard HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `404` - Not Found
- `500` - Server Error

## 🎊 Quick Start Guide

1. **Test Authentication**
   ```javascript
   // Login with test student account
   fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'student@staykaru.com',
       password: 'password123'
     })
   }).then(res => res.json()).then(console.log);
   ```

2. **Fetch Data**
   ```javascript
   // Get accommodations (use token from login)
   fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/accommodations', {
     headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' }
   }).then(res => res.json()).then(console.log);
   ```

3. **Start Building**
   - Create login/register forms
   - Build accommodation listing page
   - Add search and filter functionality
   - Implement map view with coordinates
   - Add chatbot widget

## 📞 Support

The backend is fully operational and ready for frontend development. All major features are working with real data.

**Happy coding!** 🚀

---

*Last updated: June 24, 2025*  
*Backend Status: Production Ready*  
*Total Data: 100,000+ items*
