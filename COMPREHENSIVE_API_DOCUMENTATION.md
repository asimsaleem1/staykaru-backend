# StayKaru Backend API - Comprehensive Documentation

## Table of Contents
1. [Authentication Module](#authentication-module)
2. [User Management Module](#user-management-module) 
3. [Location Module](#location-module)
4. [Accommodation Module](#accommodation-module)
5. [Booking Module](#booking-module)
6. [Food Service Module](#food-service-module)
7. [Order Module](#order-module)
8. [Payment Module](#payment-module)
9. [Review Module](#review-module)
10. [Analytics Module](#analytics-module)
11. [Notification Module](#notification-module)

---

## Authentication Module

### Base URL
```
/auth
```

### Schemas

#### User Role Enum
```typescript
enum UserRole {
  STUDENT = 'student',
  LANDLORD = 'landlord', 
  FOOD_PROVIDER = 'food_provider',
  ADMIN = 'admin'
}
```

### DTOs

#### RegisterDto
```typescript
{
  email: string,           // User email address
  password: string,        // Password (min 8 characters)
  name: string,           // User full name
  role: UserRole          // User role (student, landlord, food_provider, admin)
}
```

#### LoginDto
```typescript
{
  email: string,          // User email address
  password: string        // User password
}
```

#### Enable2FADto
```typescript
{
  email: string          // User email address for 2FA
}
```

#### Verify2FADto
```typescript
{
  email: string,         // Email address used for 2FA
  otp: string           // 6-digit OTP code
}
```

### Endpoints

#### POST /auth/register
**Description:** Register a new user
**Request Body:** RegisterDto
**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "confirmationRequired": true,
  "session": "session_object"
}
```

#### POST /auth/login
**Description:** Login user
**Request Body:** LoginDto
**Response:**
```json
{
  "message": "Login successful",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-03-21T12:00:00.000Z"
  },
  "user": "user_object"
}
```

#### POST /auth/2fa/enable
**Description:** Enable 2FA for user
**Headers:** Authorization: Bearer {token}
**Request Body:** Enable2FADto
**Response:**
```json
{
  "message": "OTP sent successfully"
}
```

#### POST /auth/2fa/verify
**Description:** Verify 2FA OTP
**Headers:** Authorization: Bearer {token}
**Request Body:** Verify2FADto
**Response:**
```json
{
  "message": "2FA verified successfully",
  "session": "session_object"
}
```

#### GET /auth/test-credentials/:role
**Description:** Get test user credentials for development
**Parameters:**
- role: string (student, landlord, food_provider, admin)
**Response:**
```json
{
  "message": "Test student credentials for manual testing",
  "credentials": {
    "email": "student.test@university.edu",
    "password": "StudentPass123!",
    "name": "Test Student",
    "role": "student"
  }
}
```

#### POST /auth/sync-user
**Description:** Sync current user to database
**Headers:** Authorization: Bearer {token}
**Request Body:**
```typescript
{
  name: string,
  role: string
}
```

#### GET /auth/protected
**Description:** Protected route example
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
  "message": "This is a protected route"
}
```

---

## User Management Module

### Base URL
```
/users
```

### Schema

#### User Schema
```typescript
{
  _id: ObjectId,
  name: string,             // User full name
  email: string,            // Unique email address
  role: UserRole,           // User role enum
  phone?: string,           // Encrypted phone number
  address?: string,         // Encrypted address
  supabaseUserId: string,   // Reference to Supabase user
  createdAt: Date,
  updatedAt: Date
}
```

### DTOs

#### CreateUserDto
```typescript
{
  name: string,            // User full name
  email: string,           // Email address
  role: UserRole,          // User role
  phone?: string,          // Optional phone number
  address?: string         // Optional address
}
```

#### UpdateUserDto
```typescript
{
  name?: string,           // Optional name update
  phone?: string,          // Optional phone update
  address?: string         // Optional address update
}
```

### Endpoints

#### POST /users
**Description:** Create a new user (Admin only)
**Headers:** Authorization: Bearer {token}
**Request Body:** CreateUserDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "phone": "+1234567890",
  "address": "123 Main St",
  "created_at": "2025-05-28T10:00:00.000Z"
}
```

#### GET /users
**Description:** Get all users (Admin only)
**Headers:** Authorization: Bearer {token}
**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "created_at": "2025-05-28T10:00:00.000Z"
  }
]
```

#### GET /users/:id
**Description:** Get a user by ID
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (User ID)
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "phone": "+1234567890",
  "address": "123 Main St",
  "created_at": "2025-05-28T10:00:00.000Z",
  "updated_at": "2025-05-28T10:00:00.000Z"
}
```

#### PUT /users/:id
**Description:** Update a user
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (User ID)
**Request Body:** UpdateUserDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Updated",
  "email": "john@example.com",
  "role": "student",
  "updated_at": "2025-05-28T11:00:00.000Z"
}
```

#### DELETE /users/:id
**Description:** Delete a user (Admin only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (User ID)
**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Location Module

### Base URL
```
/location
```

### Schemas

#### Country Schema
```typescript
{
  _id: ObjectId,
  name: string,           // Country name
  code: string,           // Country code (ISO)
  currency: string,       // Currency code
  createdAt: Date,
  updatedAt: Date
}
```

#### City Schema
```typescript
{
  _id: ObjectId,
  name: string,           // City name
  country: ObjectId,      // Reference to Country
  latitude: number,       // Geographic latitude
  longitude: number,      // Geographic longitude
  timezone: string,       // Timezone
  createdAt: Date,
  updatedAt: Date
}
```

### DTOs

#### CreateCountryDto
```typescript
{
  name: string,           // Country name
  code: string,           // Country code
  currency: string        // Currency code
}
```

#### UpdateCountryDto
```typescript
{
  name?: string,          // Optional country name update
  code?: string,          // Optional country code update
  currency?: string       // Optional currency update
}
```

#### CreateCityDto
```typescript
{
  name: string,           // City name
  country: string,        // Country ObjectId
  latitude: number,       // Geographic latitude
  longitude: number,      // Geographic longitude
  timezone: string        // Timezone
}
```

#### UpdateCityDto
```typescript
{
  name?: string,          // Optional city name update
  latitude?: number,      // Optional latitude update
  longitude?: number,     // Optional longitude update
  timezone?: string       // Optional timezone update
}
```

### Endpoints

#### Countries

#### POST /location/countries
**Description:** Create a new country
**Headers:** Authorization: Bearer {token}
**Request Body:** CreateCountryDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "United States",
  "code": "US",
  "currency": "USD",
  "created_at": "2025-05-28T10:00:00.000Z"
}
```

#### GET /location/countries
**Description:** Get all countries
**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "United States",
    "code": "US",
    "currency": "USD"
  }
]
```

#### GET /location/countries/:id
**Description:** Get a country by ID
**Parameters:**
- id: string (Country ID)
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "United States",
  "code": "US",
  "currency": "USD"
}
```

#### PUT /location/countries/:id
**Description:** Update a country
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Country ID)
**Request Body:** UpdateCountryDto

#### DELETE /location/countries/:id
**Description:** Delete a country
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Country ID)

#### Cities

#### POST /location/cities
**Description:** Create a new city
**Headers:** Authorization: Bearer {token}
**Request Body:** CreateCityDto

#### GET /location/cities
**Description:** Get all cities
**Query Parameters:**
- country?: string (Filter by country ID)

#### GET /location/cities/:id
**Description:** Get a city by ID
**Parameters:**
- id: string (City ID)

#### PUT /location/cities/:id
**Description:** Update a city
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (City ID)
**Request Body:** UpdateCityDto

#### DELETE /location/cities/:id
**Description:** Delete a city
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (City ID)

---

## Accommodation Module

### Base URL
```
/accommodations
```

### Schema

#### Accommodation Schema
```typescript
{
  _id: ObjectId,
  title: string,          // Accommodation title
  description: string,    // Detailed description
  city: ObjectId,         // Reference to City
  coordinates: {          // Geographic coordinates
    type: "Point",
    coordinates: [longitude, latitude]
  },
  price: number,          // Price per night/period
  amenities: string[],    // List of amenities
  availability: Date[],   // Available dates
  landlord: ObjectId,     // Reference to User (landlord)
  createdAt: Date,
  updatedAt: Date
}
```

### DTOs

#### CreateAccommodationDto
```typescript
{
  title: string,          // Accommodation title
  description: string,    // Detailed description
  city: string,           // City ObjectId
  latitude: number,       // Geographic latitude
  longitude: number,      // Geographic longitude
  price: number,          // Price per night/period
  amenities?: string[],   // Optional amenities list
  availability?: Date[]   // Optional availability dates
}
```

#### UpdateAccommodationDto
```typescript
{
  title?: string,         // Optional title update
  description?: string,   // Optional description update
  price?: number,         // Optional price update
  amenities?: string[],   // Optional amenities update
  availability?: Date[]   // Optional availability update
}
```

#### SearchAccommodationDto
```typescript
{
  city?: string,          // Filter by city ID
  minPrice?: number,      // Minimum price filter
  maxPrice?: number,      // Maximum price filter
  amenities?: string[],   // Filter by amenities
  startDate?: Date,       // Check availability from date
  endDate?: Date,         // Check availability to date
  limit?: number,         // Pagination limit
  page?: number           // Pagination page
}
```

### Endpoints

#### POST /accommodations
**Description:** Create a new accommodation (Landlord only)
**Headers:** Authorization: Bearer {token}
**Request Body:** CreateAccommodationDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "title": "Modern Apartment",
  "description": "Beautiful 2-bedroom apartment",
  "city": {
    "id": "507f1f77bcf86cd799439011",
    "name": "New York"
  },
  "coordinates": {
    "type": "Point",
    "coordinates": [-74.006, 40.7128]
  },
  "price": 100,
  "amenities": ["wifi", "parking"],
  "landlord": "507f1f77bcf86cd799439013",
  "created_at": "2025-05-28T10:00:00.000Z"
}
```

#### GET /accommodations
**Description:** Get all accommodations with optional search filters
**Query Parameters:** SearchAccommodationDto
**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "title": "Modern Apartment",
    "description": "Beautiful 2-bedroom apartment",
    "city": {
      "name": "New York",
      "country": "United States"
    },
    "price": 100,
    "amenities": ["wifi", "parking"],
    "coordinates": {
      "type": "Point", 
      "coordinates": [-74.006, 40.7128]
    }
  }
]
```

#### GET /accommodations/nearby
**Description:** Find accommodations near specific coordinates
**Query Parameters:**
- lat: number (Latitude)
- lng: number (Longitude)
- radius: number (Search radius in meters, default: 5000)
**Response:** Array of nearby accommodations

#### GET /accommodations/:id
**Description:** Get an accommodation by ID
**Parameters:**
- id: string (Accommodation ID)
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "title": "Modern Apartment",
  "description": "Beautiful 2-bedroom apartment",
  "city": {
    "name": "New York",
    "country": "United States"
  },
  "price": 100,
  "amenities": ["wifi", "parking"],
  "availability": ["2025-06-01", "2025-06-02"],
  "landlord": {
    "id": "507f1f77bcf86cd799439013",
    "name": "John Landlord"
  }
}
```

#### PUT /accommodations/:id
**Description:** Update an accommodation (Landlord owner only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Accommodation ID)
**Request Body:** UpdateAccommodationDto

#### DELETE /accommodations/:id
**Description:** Delete an accommodation (Landlord owner only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Accommodation ID)
**Response:**
```json
{
  "message": "Accommodation deleted successfully"
}
```

---

## Booking Module

### Base URL
```
/bookings
```

### Schema

#### Booking Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId,         // Reference to User
  accommodation: ObjectId, // Reference to Accommodation
  start_date: Date,       // Check-in date
  end_date: Date,         // Check-out date
  status: BookingStatus,  // Booking status enum
  createdAt: Date,
  updatedAt: Date
}
```

#### BookingStatus Enum
```typescript
enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}
```

### DTOs

#### CreateBookingDto
```typescript
{
  accommodation: string,  // Accommodation ObjectId
  start_date: Date,       // Check-in date
  end_date: Date          // Check-out date
}
```

#### UpdateBookingStatusDto
```typescript
{
  status: BookingStatus   // New booking status
}
```

### Endpoints

#### POST /bookings
**Description:** Create a new booking
**Headers:** Authorization: Bearer {token}
**Request Body:** CreateBookingDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "accommodation": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Modern Apartment"
  },
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "name": "John Doe"
  },
  "start_date": "2025-06-01",
  "end_date": "2025-06-05",
  "status": "pending",
  "created_at": "2025-05-28T10:00:00.000Z"
}
```

#### GET /bookings
**Description:** Get all bookings (Admin access)
**Headers:** Authorization: Bearer {token}
**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "accommodation": {
      "id": "507f1f77bcf86cd799439012",
      "title": "Modern Apartment"
    },
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "name": "John Doe"
    },
    "start_date": "2025-06-01",
    "end_date": "2025-06-05",
    "status": "confirmed"
  }
]
```

#### GET /bookings/my-bookings
**Description:** Get current user's bookings
**Headers:** Authorization: Bearer {token}
**Response:** Array of user's bookings

#### GET /bookings/:id
**Description:** Get a booking by ID
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Booking ID)

#### PUT /bookings/:id/status
**Description:** Update booking status (Landlord only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Booking ID)
**Request Body:** UpdateBookingStatusDto

---

## Food Service Module

### Base URL
```
/food-providers (Food Providers)
/menu-items (Menu Items)
```

### Schemas

#### FoodProvider Schema
```typescript
{
  _id: ObjectId,
  name: string,           // Restaurant/provider name
  description: string,    // Description
  location: ObjectId,     // Reference to City
  cuisine_type?: string,  // Type of cuisine
  operating_hours?: {     // Operating hours
    open: string,         // Opening time (HH:MM)
    close: string         // Closing time (HH:MM)
  },
  contact_info?: {        // Contact information
    phone: string,
    email: string
  },
  owner: ObjectId,        // Reference to User (food provider)
  is_active: boolean,     // Active status
  rating: number,         // Average rating
  total_reviews: number,  // Total review count
  createdAt: Date,
  updatedAt: Date
}
```

#### MenuItem Schema
```typescript
{
  _id: ObjectId,
  name: string,           // Item name
  description: string,    // Item description
  price: number,          // Item price
  category: string,       // Food category
  ingredients?: string[], // Ingredients list
  allergens?: string[],   // Allergen information
  nutritional_info?: {    // Nutritional information
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  },
  food_provider: ObjectId, // Reference to FoodProvider
  is_available: boolean,   // Availability status
  createdAt: Date,
  updatedAt: Date
}
```

### DTOs

#### CreateFoodProviderDto
```typescript
{
  name: string,           // Provider name
  description: string,    // Description
  location: string,       // City ObjectId
  cuisine_type?: string,  // Optional cuisine type
  operating_hours?: {     // Optional operating hours
    open: string,
    close: string
  },
  contact_info?: {        // Optional contact info
    phone: string,
    email: string
  },
  is_active?: boolean     // Optional active status
}
```

#### UpdateFoodProviderDto
```typescript
{
  name?: string,          // Optional name update
  description?: string,   // Optional description update
  cuisine_type?: string,  // Optional cuisine type update
  operating_hours?: {     // Optional hours update
    open: string,
    close: string
  },
  contact_info?: {        // Optional contact update
    phone: string,
    email: string
  },
  is_active?: boolean     // Optional status update
}
```

#### CreateMenuItemDto
```typescript
{
  name: string,           // Item name
  description: string,    // Item description
  price: number,          // Item price
  category: string,       // Food category
  ingredients?: string[], // Optional ingredients
  allergens?: string[],   // Optional allergens
  nutritional_info?: {    // Optional nutrition info
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  },
  food_provider: string,  // FoodProvider ObjectId
  is_available?: boolean  // Optional availability
}
```

#### UpdateMenuItemDto
```typescript
{
  name?: string,          // Optional name update
  description?: string,   // Optional description update
  price?: number,         // Optional price update
  category?: string,      // Optional category update
  ingredients?: string[], // Optional ingredients update
  allergens?: string[],   // Optional allergens update
  nutritional_info?: {    // Optional nutrition update
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  },
  is_available?: boolean  // Optional availability update
}
```

### Food Provider Endpoints

#### POST /food-providers
**Description:** Create a new food provider (Food Provider role only)
**Headers:** Authorization: Bearer {token}
**Request Body:** CreateFoodProviderDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Delicious Eats",
  "description": "Authentic local cuisine",
  "location": {
    "address": "456 Food Street",
    "city": "Food City",
    "country": "CountryName"
  },
  "cuisine_type": "Italian",
  "operating_hours": {
    "open": "09:00",
    "close": "22:00"
  },
  "contact_info": {
    "phone": "+1234567890",
    "email": "info@deliciouseats.com"
  },
  "owner_id": "507f1f77bcf86cd799439012"
}
```

#### GET /food-providers
**Description:** Get all food providers
**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Delicious Eats",
    "cuisine_type": "Italian",
    "location": {
      "city": "Food City",
      "country": "CountryName"
    },
    "rating": 4.5,
    "total_reviews": 25
  }
]
```

#### GET /food-providers/:id
**Description:** Get a food provider by ID
**Parameters:**
- id: string (Food Provider ID)
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Delicious Eats",
  "description": "Authentic local cuisine",
  "cuisine_type": "Italian",
  "location": {
    "address": "456 Food Street",
    "city": "Food City",
    "country": "CountryName"
  },
  "operating_hours": {
    "open": "09:00",
    "close": "22:00"
  },
  "contact_info": {
    "phone": "+1234567890",
    "email": "info@deliciouseats.com"
  },
  "menu_items": [],
  "rating": 4.5,
  "total_reviews": 25
}
```

#### PUT /food-providers/:id
**Description:** Update a food provider (Owner only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Food Provider ID)
**Request Body:** UpdateFoodProviderDto

#### DELETE /food-providers/:id
**Description:** Delete a food provider (Owner only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Food Provider ID)
**Response:**
```json
{
  "message": "Food provider deleted successfully"
}
```

### Menu Item Endpoints

#### POST /menu-items
**Description:** Create a new menu item (Food Provider only)
**Headers:** Authorization: Bearer {token}
**Request Body:** CreateMenuItemDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato and mozzarella",
  "price": 12.99,
  "category": "Pizza",
  "ingredients": ["tomato", "mozzarella", "basil"],
  "food_provider": "507f1f77bcf86cd799439012",
  "is_available": true
}
```

#### GET /menu-items
**Description:** Get all menu items
**Query Parameters:**
- food_provider?: string (Filter by provider ID)
- category?: string (Filter by category)
- is_available?: boolean (Filter by availability)
**Response:** Array of menu items

#### GET /menu-items/:id
**Description:** Get a menu item by ID
**Parameters:**
- id: string (Menu Item ID)

#### PUT /menu-items/:id
**Description:** Update a menu item (Food Provider owner only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Menu Item ID)
**Request Body:** UpdateMenuItemDto

#### DELETE /menu-items/:id
**Description:** Delete a menu item (Food Provider owner only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Menu Item ID)

---

## Order Module

### Base URL
```
/orders
```

### Schema

#### Order Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId,         // Reference to User
  food_provider: ObjectId, // Reference to FoodProvider
  items: [{               // Order items
    menu_item: ObjectId,  // Reference to MenuItem
    quantity: number,     // Item quantity
    price: number         // Item price at time of order
  }],
  total_amount: number,   // Total order amount
  status: OrderStatus,    // Order status
  delivery_address?: string, // Optional delivery address
  notes?: string,         // Optional order notes
  createdAt: Date,
  updatedAt: Date
}
```

#### OrderStatus Enum
```typescript
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}
```

### DTOs

#### CreateOrderDto
```typescript
{
  food_provider: string,  // FoodProvider ObjectId
  items: [{               // Order items
    menu_item: string,    // MenuItem ObjectId
    quantity: number      // Item quantity (min: 1)
  }],
  delivery_address?: string, // Optional delivery address
  notes?: string          // Optional order notes
}
```

#### UpdateOrderStatusDto
```typescript
{
  status: OrderStatus     // New order status
}
```

### Endpoints

#### POST /orders
**Description:** Create a new order
**Headers:** Authorization: Bearer {token}
**Request Body:** CreateOrderDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe"
  },
  "food_provider": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Delicious Eats"
  },
  "items": [
    {
      "menu_item": {
        "id": "507f1f77bcf86cd799439014",
        "name": "Margherita Pizza"
      },
      "quantity": 2,
      "price": 12.99
    }
  ],
  "total_amount": 25.98,
  "status": "pending",
  "created_at": "2025-05-28T10:00:00.000Z"
}
```

#### GET /orders
**Description:** Get all orders (Admin only)
**Headers:** Authorization: Bearer {token}
**Response:** Array of all orders

#### GET /orders/my-orders
**Description:** Get current user's orders
**Headers:** Authorization: Bearer {token}
**Response:** Array of user's orders

#### GET /orders/provider-orders
**Description:** Get food provider's orders (Food Provider only)
**Headers:** Authorization: Bearer {token}
**Response:** Array of provider's orders

#### GET /orders/:id
**Description:** Get an order by ID
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Order ID)

#### PUT /orders/:id/status
**Description:** Update order status (Food Provider only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Order ID)
**Request Body:** UpdateOrderStatusDto

---

## Payment Module

### Base URL
```
/payments
```

### Schema

#### Payment Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId,         // Reference to User
  order?: ObjectId,       // Reference to Order (for food)
  booking?: ObjectId,     // Reference to Booking (for accommodation)
  amount: number,         // Payment amount
  currency: string,       // Currency code
  payment_method: PaymentMethod, // Payment method enum
  transaction_id: string, // External transaction ID
  status: PaymentStatus,  // Payment status
  gateway_response?: any, // Gateway response data
  createdAt: Date,
  updatedAt: Date
}
```

#### PaymentMethod Enum
```typescript
enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  JAZZCASH = 'jazzcash',
  BANK_TRANSFER = 'bank_transfer'
}
```

#### PaymentStatus Enum
```typescript
enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

### DTOs

#### CreatePaymentDto
```typescript
{
  order?: string,         // Optional Order ObjectId
  booking?: string,       // Optional Booking ObjectId
  amount: number,         // Payment amount
  currency: string,       // Currency code
  payment_method: PaymentMethod, // Payment method
  payment_details: any    // Payment gateway specific details
}
```

### Endpoints

#### POST /payments/process
**Description:** Process a payment
**Headers:** Authorization: Bearer {token}
**Request Body:** CreatePaymentDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "transaction_id": "TXN123456789",
  "amount": 25.98,
  "currency": "USD",
  "status": "completed",
  "payment_method": "credit_card",
  "created_at": "2025-05-28T10:00:00.000Z"
}
```

#### GET /payments
**Description:** Get all payments (Admin only)
**Headers:** Authorization: Bearer {token}
**Response:** Array of all payments

#### GET /payments/my-payments
**Description:** Get current user's payments
**Headers:** Authorization: Bearer {token}
**Response:** Array of user's payments

#### GET /payments/verify/:transaction_id
**Description:** Verify payment status
**Parameters:**
- transaction_id: string (Transaction ID)
**Response:**
```json
{
  "verified": true
}
```

---

## Review Module

### Base URL
```
/reviews
```

### Schema

#### Review Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId,         // Reference to User
  target_type: ReviewTargetType, // Target type enum
  target_id: ObjectId,    // Reference to target (accommodation/food_provider)
  rating: number,         // Rating (1-5)
  comment?: string,       // Optional review comment
  createdAt: Date,
  updatedAt: Date
}
```

#### ReviewTargetType Enum
```typescript
enum ReviewTargetType {
  ACCOMMODATION = 'accommodation',
  FOOD_PROVIDER = 'food_provider'
}
```

### DTOs

#### CreateReviewDto
```typescript
{
  target_type: ReviewTargetType, // Target type
  target_id: string,      // Target ObjectId
  rating: number,         // Rating (1-5)
  comment?: string        // Optional comment
}
```

#### UpdateReviewDto
```typescript
{
  rating?: number,        // Optional rating update
  comment?: string        // Optional comment update
}
```

### Endpoints

#### POST /reviews
**Description:** Create a new review
**Headers:** Authorization: Bearer {token}
**Request Body:** CreateReviewDto
**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe"
  },
  "target_type": "accommodation",
  "target_id": "507f1f77bcf86cd799439013",
  "rating": 5,
  "comment": "Excellent place to stay!",
  "created_at": "2025-05-28T10:00:00.000Z"
}
```

#### GET /reviews
**Description:** Get all reviews
**Response:** Array of all reviews

#### GET /reviews/target
**Description:** Get reviews for a specific target
**Query Parameters:**
- type: string (target type)
- id: string (target ID)
**Response:** Array of target reviews

#### GET /reviews/:id
**Description:** Get a review by ID
**Parameters:**
- id: string (Review ID)

#### PUT /reviews/:id
**Description:** Update a review (Review author only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Review ID)
**Request Body:** UpdateReviewDto

#### DELETE /reviews/:id
**Description:** Delete a review (Review author only)
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Review ID)

---

## Analytics Module

### Base URL
```
/analytics
```

### Endpoints (Admin Only)

#### GET /analytics/bookings
**Description:** Get booking analytics
**Headers:** Authorization: Bearer {token}
**Query Parameters:**
- startDate?: string (Start date filter)
- endDate?: string (End date filter)
- period?: string (Period: daily, weekly, monthly)
**Response:**
```json
{
  "total_bookings": 150,
  "confirmed_bookings": 120,
  "cancelled_bookings": 20,
  "revenue": 15000,
  "period_data": [
    {
      "date": "2025-05-01",
      "bookings": 10,
      "revenue": 1000
    }
  ]
}
```

#### GET /analytics/orders
**Description:** Get order analytics
**Headers:** Authorization: Bearer {token}
**Query Parameters:**
- startDate?: string (Start date filter)
- endDate?: string (End date filter)
- period?: string (Period: daily, weekly, monthly)
**Response:**
```json
{
  "total_orders": 500,
  "completed_orders": 450,
  "cancelled_orders": 30,
  "revenue": 25000,
  "popular_items": [
    {
      "item_name": "Margherita Pizza",
      "orders": 50
    }
  ]
}
```

#### GET /analytics/payments
**Description:** Get payment analytics
**Headers:** Authorization: Bearer {token}
**Query Parameters:**
- startDate?: string (Start date filter)
- endDate?: string (End date filter)
- period?: string (Period: daily, weekly, monthly)
**Response:**
```json
{
  "total_payments": 30000,
  "successful_payments": 28000,
  "failed_payments": 2000,
  "payment_methods": [
    {
      "method": "credit_card",
      "count": 300,
      "amount": 20000
    }
  ]
}
```

---

## Notification Module

### Base URL
```
/notifications
```

### Schema

#### Notification Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId,         // Reference to User
  title: string,          // Notification title
  message: string,        // Notification message
  type: NotificationType, // Notification type
  data?: any,            // Additional data
  read: boolean,          // Read status
  createdAt: Date,
  updatedAt: Date
}
```

#### NotificationType Enum
```typescript
enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_READY = 'order_ready',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed'
}
```

### Endpoints

#### GET /notifications
**Description:** Get user notifications
**Headers:** Authorization: Bearer {token}
**Query Parameters:**
- read?: boolean (Filter by read status)
- type?: NotificationType (Filter by type)
**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Booking Confirmed",
    "message": "Your booking has been confirmed",
    "type": "booking_confirmed",
    "read": false,
    "created_at": "2025-05-28T10:00:00.000Z"
  }
]
```

#### PUT /notifications/:id/read
**Description:** Mark notification as read
**Headers:** Authorization: Bearer {token}
**Parameters:**
- id: string (Notification ID)

#### PUT /notifications/mark-all-read
**Description:** Mark all notifications as read
**Headers:** Authorization: Bearer {token}

---

## Common Response Formats

### Success Response
```json
{
  "status": "success",
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": []
  }
}
```

### Pagination
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Authentication

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Error Codes
- 401: Unauthorized (Invalid or missing token)
- 403: Forbidden (Insufficient permissions)
- 404: Not Found
- 400: Bad Request (Validation errors)
- 500: Internal Server Error

---

## Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Base URL
```
https://api.staykaru.com/v1
```
