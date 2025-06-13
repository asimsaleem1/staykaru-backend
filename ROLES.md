# StayKaro System Roles Documentation

## Overview
The StayKaro platform supports multiple user roles, each with specific permissions and access levels. This document defines all roles, their purposes, and access permissions.

## User Roles

### 1. STUDENT (`student`)
**Purpose**: Students looking for accommodation and food services
**Primary Use Cases**:
- Search and browse accommodations
- Book accommodation properties
- Browse food menus and place orders
- Leave reviews for accommodations and food services
- Manage personal bookings and orders

**Permissions**:
- ✅ View all accommodations
- ✅ Create accommodation bookings
- ✅ View all food menus
- ✅ Place food orders
- ✅ Create reviews
- ✅ Manage own profile
- ❌ Create accommodations
- ❌ Create food menus
- ❌ Access admin functions

**Test Credentials**:
- Email: `student.test@university.edu`
- Password: `StudentPass123!`

---

### 2. LANDLORD (`landlord`)
**Purpose**: Property owners who rent accommodations to students
**Primary Use Cases**:
- List and manage accommodation properties
- Manage booking requests and approvals
- View analytics for their properties
- Respond to student reviews

**Permissions**:
- ✅ Create and manage accommodations
- ✅ View bookings for their properties
- ✅ Update booking statuses (approve/reject)
- ✅ View property analytics
- ✅ Manage own profile
- ✅ View student profiles (for bookings)
- ❌ Create food menus
- ❌ Access admin functions
- ❌ Manage other landlords' properties

**Test Credentials**:
- Email: `landlord.test@property.com`
- Password: `LandlordPass123!`

**Protected Endpoints**:
- `POST /accommodations` - Create accommodation
- `PUT /accommodations/:id` - Update accommodation
- `DELETE /accommodations/:id` - Delete accommodation
- `GET /bookings/landlord-bookings` - View landlord's bookings
- `PATCH /bookings/:id/status` - Update booking status

---

### 3. FOOD_PROVIDER (`food_provider`)
**Purpose**: Restaurant/food service providers offering meals to students
**Primary Use Cases**:
- Create and manage food menus
- Manage food orders and order statuses
- View food service analytics
- Respond to food reviews

**Permissions**:
- ✅ Create and manage food menus
- ✅ Create and manage menu items
- ✅ View orders for their restaurant
- ✅ Update order statuses
- ✅ View food service analytics
- ✅ Manage own profile
- ❌ Create accommodations
- ❌ Access admin functions
- ❌ Manage other providers' menus

**Test Credentials**:
- Email: `foodprovider.test@restaurant.com`
- Password: `FoodPass123!`

**Protected Endpoints**:
- `POST /food-services` - Create food service
- `PUT /food-services/:id` - Update food service
- `POST /food-services/:id/menu-items` - Add menu items
- `PUT /menu-items/:id` - Update menu items
- `GET /orders/provider-orders` - View provider's orders
- `PATCH /orders/:id/status` - Update order status

---

### 4. ADMIN (`admin`)
**Purpose**: System administrators with full access
**Primary Use Cases**:
- Manage all users and their roles
- Access system analytics and reports
- Moderate content and reviews
- Manage system configurations
- Handle disputes and issues

**Permissions**:
- ✅ Full access to all system functions
- ✅ Create, read, update, delete all users
- ✅ Access comprehensive analytics
- ✅ Manage all accommodations and food services
- ✅ View all bookings and orders
- ✅ Manage system notifications
- ✅ Access admin dashboard

**Test Credentials**:
- Email: `admin.test@staykaro.com`
- Password: `AdminPass123!`

**Admin-Only Endpoints**:
- `GET /users` - List all users
- `DELETE /users/:id` - Delete users
- `GET /analytics/*` - System analytics
- `GET /notifications` - System notifications

---

## Role-Based Access Control Implementation

### Guards
- **LandlordGuard**: Restricts access to landlord-only functions
- **FoodProviderGuard**: Restricts access to food provider-only functions
- **RolesGuard**: Generic role-based access control
- **AuthGuard**: Basic authentication requirement

### Decorators
- `@Roles(UserRole.ADMIN)`: Admin access only
- `@Roles(UserRole.LANDLORD)`: Landlord access only
- `@Roles(UserRole.FOOD_PROVIDER)`: Food provider access only
- `@Roles(UserRole.STUDENT, UserRole.LANDLORD)`: Multiple role access

### Usage Example
```typescript
@Get('admin-only')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async adminFunction() {
  // Admin-only functionality
}
```

---

## Role Hierarchy

```
ADMIN (Full Access)
├── Can manage all users
├── Can access all endpoints
├── Can view all analytics
└── Can perform system administration

LANDLORD (Property Management)
├── Can manage own accommodations
├── Can view own property bookings
├── Can approve/reject bookings
└── Limited to accommodation features

FOOD_PROVIDER (Food Service Management)
├── Can manage own food services
├── Can view own restaurant orders
├── Can update order statuses
└── Limited to food service features

STUDENT (Consumer)
├── Can view accommodations
├── Can make bookings
├── Can view food menus
├── Can place orders
└── Consumer-level access only
```

---

## Email Domain Patterns for Registration

Each role should use appropriate email domains for Supabase validation:

- **Students**: `@university.edu`, `@college.edu`, `@student.edu`
- **Landlords**: `@property.com`, `@realty.com`, `@housing.com`
- **Food Providers**: `@restaurant.com`, `@food.com`, `@catering.com`
- **Admins**: `@staykaro.com`, `@admin.com`

---

## Getting Started

### For Development Testing
1. Use the test credentials endpoint: `GET /auth/test-credentials/{role}`
2. Register users with the provided credentials
3. Login to get JWT tokens
4. Test role-specific endpoints with appropriate tokens

### Production Guidelines
- Implement proper email verification
- Use strong password policies
- Regularly audit user roles and permissions
- Monitor role-based access logs
