# StayKaru Backend - Frontend Integration Guide (Updated)

## Backend Status: ✅ DEPLOYED & READY

The StayKaru backend has been successfully deployed to Heroku with all required features implemented and tested. The backend is now ready for frontend integration.

## API Details

- **Base URL**: `https://staykaru-backend-60ed08adb2a7.herokuapp.com`
- **API Documentation**: See `FRONTEND_API_REFERENCE.md` for comprehensive API details
- **Authentication**: JWT-based with role-based access control

## Authentication Integration

### Registration Flow
1. Use `POST /auth/register` with required fields
2. Frontend should validate fields before submission
3. Redirect to login page after successful registration

### Login Flow
1. Use `POST /auth/login` with email and password
2. Store the returned JWT token securely (localStorage, secure cookies)
3. Store user details including role for role-based UI rendering
4. Include token in all authenticated requests: `Authorization: Bearer {token}`

### Role-Based Routing
- Check `user.role` to determine available routes and features:
  - `user`: Regular user dashboard
  - `landlord`: Landlord dashboard
  - `food_provider`: Food provider dashboard
  - `admin`: Admin dashboard

## Frontend Components by Role

### Public Pages (No Authentication)
- Homepage with search
- Accommodation listings
- Accommodation details
- Food provider listings
- Food provider details
- Login/Registration pages

### User Dashboard
- Profile management
- Booking history
- Favorites
- Reviews

### Landlord Dashboard
- Dashboard overview with statistics
- Accommodation management
- Bookings management
- Revenue tracking
- Profile settings

### Admin Dashboard
- User management
- Approval workflows (accommodations, food providers)
- Platform statistics
- Settings

## Key API Endpoints by Feature

### Accommodation Management
- Listing: `GET /accommodations` (public)
- Details: `GET /accommodations/:id` (public)
- Create: `POST /accommodations` (landlord)
- Landlord View: `GET /accommodations/landlord` (landlord)
- Approval: `PATCH /accommodations/admin/:id/approve` (admin)

### User Management
- Profile: `GET /users/profile` (authenticated)
- Update Profile: `PATCH /users/profile` (authenticated)
- Change Password: `PUT /users/change-password` (authenticated)
- Admin User List: `GET /users/admin/all` (admin)

### Landlord Dashboard
- Overview: `GET /accommodations/landlord/dashboard` (landlord)
- Statistics: `GET /users/landlord/statistics` (landlord)
- Revenue: `GET /users/landlord/revenue` (landlord)
- Bookings: `GET /users/landlord/bookings` (landlord)

### Admin Controls
- Dashboard: `GET /analytics/dashboard` (admin)
- Pending Accommodations: `GET /accommodations/admin/pending` (admin)
- Pending Food Providers: `GET /food-providers/admin/pending` (admin)
- Toggle User Status: `PATCH /users/admin/:userId/toggle-status` (admin)

## Error Handling

Implement consistent error handling for API responses:
- HTTP 400: Invalid request parameters (form validation errors)
- HTTP 401: Authentication required or token expired
- HTTP 403: Insufficient permissions for the requested resource
- HTTP 404: Resource not found
- HTTP 500: Server error

Display appropriate user-friendly error messages based on the response.

## Testing Accounts

For testing the backend API:

- **Admin User**:
  - Email: `assaleemofficial@gmail.com`
  - Password: `Sarim786`

- **Test Users**:
  - Create test accounts using the registration endpoint
  - Create landlords by setting role to "landlord" during registration

## Implementation Tips

1. **State Management**:
   - Use Redux or Context API for global state management
   - Maintain authentication state and user details

2. **Form Validation**:
   - Implement client-side validation before API calls
   - Show validation errors from API responses

3. **Protected Routes**:
   - Create route guards based on authentication state and user role
   - Redirect unauthorized access to login page

4. **Loading States**:
   - Show loading indicators during API calls
   - Implement skeleton screens for better UX

5. **Responsive Design**:
   - Ensure all components work on mobile, tablet, and desktop
   - Consider mobile-first approach

## Next Steps

1. Set up frontend project structure
2. Implement authentication flow
3. Create public pages
4. Implement role-based dashboards
5. Connect all features to the backend API
6. Test integration thoroughly

---

**The backend is ready for frontend integration. Happy coding!**
