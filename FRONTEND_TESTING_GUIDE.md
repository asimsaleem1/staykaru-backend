# StayKaru Frontend Testing Guide

## Overview
This guide provides comprehensive instructions for testing the StayKaru frontend application against the backend API endpoints. It covers both manual testing procedures and automated testing strategies.

## Prerequisites

### 1. Backend Setup
- Ensure the StayKaru backend is running on: `https://staykaru-backend-60ed08adb2a7.herokuapp.com`
- Verify all API endpoints are accessible
- Run the backend test script to ensure API functionality: `.\STUDENT_MODULE_COMPREHENSIVE_TEST.ps1`

### 2. Frontend Setup
- Node.js (v16 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Frontend development server running
- API testing tools (Postman, Insomnia, or browser dev tools)

### 3. Test Data
- Valid test user credentials
- Sample accommodation and food provider data
- Test payment methods
- Mock location data

## Testing Methodology

### Phase 1: API Integration Testing

#### 1.1 Authentication Flow Testing
```javascript
// Test user registration
const registrationData = {
  name: "Test Student",
  email: "test.student@example.com",
  password: "StrongPassword123!",
  role: "student",
  phone: "1234567890",
  countryCode: "+1",
  gender: "male",
  dateOfBirth: "1998-05-15",
  address: "123 University Ave",
  university: "Test University",
  studentId: "STU12345"
};

// Test user login
const loginData = {
  email: "test.student@example.com",
  password: "StrongPassword123!"
};
```

**Expected Results:**
- ✅ Successful registration returns access token
- ✅ Login returns valid JWT token
- ✅ Token persists in localStorage/sessionStorage
- ✅ Automatic redirect to dashboard on successful login

#### 1.2 Profile Management Testing
```javascript
// Test profile retrieval
GET /api/auth/profile
Authorization: Bearer <token>

// Test profile update
PUT /api/users/profile
{
  "phone": "9876543210",
  "address": "Updated Address"
}
```

**Expected Results:**
- ✅ Profile data loads correctly
- ✅ Profile updates save successfully
- ✅ Form validation works properly
- ✅ Error handling for invalid data

### Phase 2: Core Functionality Testing

#### 2.1 Accommodation Discovery
```javascript
// Test accommodation listing
GET /api/accommodations

// Test accommodation details
GET /api/accommodations/:id

// Test nearby accommodations
GET /api/accommodations/nearby?lat=40.7128&lng=-74.0060&radius=10
```

**Testing Checklist:**
- [ ] Accommodation list displays with proper formatting
- [ ] Search and filter functionality works
- [ ] Map integration shows correct locations
- [ ] Image galleries load properly
- [ ] Pricing information is accurate
- [ ] Availability calendar functions correctly

#### 2.2 Booking Management
```javascript
// Test booking creation
POST /api/bookings
{
  "accommodation": "accommodation_id",
  "start_date": "2025-06-01T00:00:00.000Z",
  "end_date": "2025-06-02T00:00:00.000Z",
  "payment_method": "card",
  "total_amount": 500,
  "guests": 2,
  "special_requests": "Late check-in"
}

// Test my bookings
GET /api/bookings/my-bookings
```

**Testing Checklist:**
- [ ] Booking form validates all required fields
- [ ] Date picker prevents past dates
- [ ] Price calculation updates dynamically
- [ ] Payment integration works (if implemented)
- [ ] Booking confirmation displays correctly
- [ ] Booking history shows all user bookings

#### 2.3 Food Service Integration
```javascript
// Test food providers
GET /api/food-providers

// Test menu items
GET /api/menu-items?foodProvider=provider_id

// Test order creation
POST /api/orders
{
  "food_provider": "provider_id",
  "total_amount": 42.48,
  "items": [{
    "menu_item": "item_id",
    "quantity": 2,
    "special_instructions": "Extra spicy"
  }],
  "delivery_location": {
    "coordinates": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "address": "123 University Ave",
    "landmark": "Near Library"
  }
}
```

**Testing Checklist:**
- [ ] Restaurant list loads with proper filtering
- [ ] Menu displays with categories and pricing
- [ ] Shopping cart functionality works
- [ ] Order customization options function
- [ ] Delivery address selection works
- [ ] Order tracking displays correctly

### Phase 3: User Experience Testing

#### 3.1 Responsive Design Testing
**Test Devices:**
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024, 1024x768)
- Mobile (375x667, 414x896, 360x640)

**Testing Points:**
- [ ] Navigation menu adapts to screen size
- [ ] Forms are usable on mobile devices
- [ ] Images scale appropriately
- [ ] Text remains readable at all sizes
- [ ] Touch targets are appropriately sized

#### 3.2 Performance Testing
**Metrics to Monitor:**
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Image optimization (WebP/AVIF support)
- [ ] JavaScript bundle size < 1MB
- [ ] CSS bundle size < 100KB

#### 3.3 Accessibility Testing
**WCAG 2.1 Compliance:**
- [ ] Keyboard navigation works for all interactions
- [ ] Screen reader compatibility
- [ ] Color contrast ratios meet AA standards
- [ ] Alt text for all images
- [ ] Proper heading hierarchy
- [ ] Focus indicators visible

### Phase 4: Cross-Browser Testing

#### 4.1 Browser Compatibility
**Test Browsers:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Test Features:**
- [ ] Authentication flow
- [ ] Form submissions
- [ ] File uploads (if applicable)
- [ ] Date/time pickers
- [ ] Map interactions
- [ ] Payment processing

### Phase 5: Error Handling Testing

#### 5.1 Network Error Scenarios
- [ ] No internet connection
- [ ] Slow network conditions
- [ ] API server downtime
- [ ] Timeout scenarios
- [ ] Rate limiting responses

#### 5.2 Validation Error Testing
- [ ] Form validation messages display correctly
- [ ] Server-side validation errors are handled
- [ ] User-friendly error messages
- [ ] Recovery mechanisms work properly

### Phase 6: Security Testing

#### 6.1 Authentication Security
- [ ] Token expiration handling
- [ ] Automatic logout on token expiry
- [ ] Protected routes redirect to login
- [ ] Sensitive data not stored in localStorage
- [ ] XSS protection measures

#### 6.2 Data Protection
- [ ] Input sanitization
- [ ] HTTPS enforcement
- [ ] No sensitive data in URL parameters
- [ ] Proper CORS configuration

## Automated Testing Framework

### E2E Testing with Cypress

```javascript
// cypress/integration/student-flow.spec.js
describe('Student User Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should complete full booking flow', () => {
    // Login
    cy.get('[data-testid=email-input]').type('test@example.com')
    cy.get('[data-testid=password-input]').type('password123')
    cy.get('[data-testid=login-button]').click()

    // Navigate to accommodations
    cy.get('[data-testid=accommodations-link]').click()

    // Select accommodation
    cy.get('[data-testid=accommodation-card]').first().click()

    // Create booking
    cy.get('[data-testid=book-now-button]').click()
    cy.get('[data-testid=checkin-date]').type('2025-07-01')
    cy.get('[data-testid=checkout-date]').type('2025-07-03')
    cy.get('[data-testid=guests-select]').select('2')
    cy.get('[data-testid=confirm-booking]').click()

    // Verify booking confirmation
    cy.get('[data-testid=booking-confirmation]').should('be.visible')
  })
})
```

### Unit Testing with Jest

```javascript
// src/components/BookingForm.test.js
import { render, screen, fireEvent } from '@testing-library/react'
import BookingForm from './BookingForm'

describe('BookingForm', () => {
  test('validates required fields', () => {
    render(<BookingForm />)
    
    fireEvent.click(screen.getByRole('button', { name: /book now/i }))
    
    expect(screen.getByText(/check-in date is required/i)).toBeInTheDocument()
    expect(screen.getByText(/check-out date is required/i)).toBeInTheDocument()
  })

  test('calculates total price correctly', () => {
    const mockAccommodation = { price: 100 }
    render(<BookingForm accommodation={mockAccommodation} />)
    
    fireEvent.change(screen.getByLabelText(/check-in/i), {
      target: { value: '2025-07-01' }
    })
    fireEvent.change(screen.getByLabelText(/check-out/i), {
      target: { value: '2025-07-03' }
    })
    
    expect(screen.getByText(/total: \$200/i)).toBeInTheDocument()
  })
})
```

## Test Reporting

### Daily Test Report Format
```markdown
## Test Execution Report - [Date]

### Summary
- Total Test Cases: X
- Passed: Y
- Failed: Z
- Blocked: A
- Pass Rate: B%

### Failed Test Cases
1. **Test Case Name**
   - **Expected:** Description
   - **Actual:** Description
   - **Steps to Reproduce:** 
   - **Priority:** High/Medium/Low

### Browser Compatibility Issues
- Chrome: ✅ All tests passed
- Firefox: ⚠️ Minor styling issues
- Safari: ❌ Date picker not working
- Edge: ✅ All tests passed

### Performance Metrics
- Average Page Load Time: X seconds
- Average API Response Time: Y milliseconds
- Bundle Size: Z KB

### Recommendations
- List of improvements needed
- Priority order for fixes
- Estimated effort for each fix
```

## Continuous Integration Setup

### GitHub Actions Workflow
```yaml
name: Frontend Testing
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

## Best Practices

### 1. Test Data Management
- Use factories for creating test data
- Implement database seeding for consistent test environments
- Clean up test data after each test run

### 2. Test Organization
- Group tests by feature/module
- Use descriptive test names
- Maintain test documentation

### 3. Maintenance
- Review and update tests regularly
- Remove obsolete tests
- Keep test dependencies up to date

### 4. Collaboration
- Share test results with development team
- Conduct test reviews
- Document known issues and workarounds

## Troubleshooting Common Issues

### API Connection Issues
```javascript
// Check API connectivity
const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    console.log('API Status:', response.status)
  } catch (error) {
    console.error('API unreachable:', error)
  }
}
```

### Authentication Issues
```javascript
// Debug token issues
const debugAuth = () => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('Token expires:', new Date(payload.exp * 1000))
  }
}
```

### Network Issues
```javascript
// Test with different network conditions
const testNetworkConditions = {
  'slow-3g': { downloadThroughput: 400 * 1024, uploadThroughput: 200 * 1024 },
  'fast-3g': { downloadThroughput: 1.6 * 1024 * 1024, uploadThroughput: 750 * 1024 }
}
```

## Conclusion

This testing guide provides a comprehensive framework for ensuring the StayKaru frontend application meets quality standards and provides an excellent user experience. Regular execution of these test procedures will help maintain application reliability and performance.

For questions or updates to this guide, contact the QA team or refer to the project documentation.
