import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Student Dashboard E2E Tests', () => {
  let app: INestApplication;
  let studentToken: string;
  let studentUser: any;
  let testAccommodationId: string;
  let testFoodProviderId: string;
  let testBookingId: string;
  let testOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create and authenticate test student
    await setupTestStudent();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestStudent() {
    // Register test student
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test Student Dashboard',
        email: 'student.dashboard.test@university.edu',
        password: 'StudentPass123!',
        role: 'student',
        phone: '+1234567890',
      });

    expect(registerResponse.status).toBe(201);

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'student.dashboard.test@university.edu',
        password: 'StudentPass123!',
      });

    expect(loginResponse.status).toBe(200);
    studentToken = loginResponse.body.access_token;
    studentUser = loginResponse.body.user;
  }

  async function cleanupTestData() {
    // Cleanup will be handled by cascading deletes
    if (studentUser) {
      await request(app.getHttpServer())
        .delete(`/users/${studentUser._id}`)
        .set('Authorization', `Bearer ${studentToken}`);
    }
  }

  describe('Student Authentication & Profile Management', () => {
    it('should authenticate student successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'student.dashboard.test@university.edu',
          password: 'StudentPass123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.role).toBe('student');
      expect(response.body.user.email).toBe('student.dashboard.test@university.edu');
    });

    it('should get student profile information', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.name).toBe('Test Student Dashboard');
      expect(response.body.email).toBe('student.dashboard.test@university.edu');
      expect(response.body.role).toBe('student');
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should update student profile successfully', async () => {
      const updateData = {
        name: 'Updated Test Student',
        phone: '+1987654321',
      };

      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Test Student');
      expect(response.body.phone).toBe('+1987654321');
      expect(response.body.email).toBe('student.dashboard.test@university.edu'); // Should remain unchanged
    });

    it('should change password successfully', async () => {
      const passwordChangeData = {
        currentPassword: 'StudentPass123!',
        newPassword: 'NewStudentPass123!',
      };

      const response = await request(app.getHttpServer())
        .put('/auth/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(passwordChangeData)
        .expect(200);

      expect(response.body.message).toBe('Password changed successfully');

      // Test login with new password
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'student.dashboard.test@university.edu',
          password: 'NewStudentPass123!',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
    });

    it('should reject unauthorized access to profile', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });

    it('should reject invalid password change', async () => {
      const invalidPasswordData = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewStudentPass123!',
      };

      await request(app.getHttpServer())
        .put('/auth/change-password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidPasswordData)
        .expect(400);
    });
  });

  describe('Student Dashboard Overview', () => {
    beforeEach(async () => {
      await setupTestData();
    });

    async function setupTestData() {
      // Create test accommodation (requires landlord role, so we'll use existing one)
      const accommodationsResponse = await request(app.getHttpServer())
        .get('/accommodations')
        .set('Authorization', `Bearer ${studentToken}`);

      if (accommodationsResponse.body.length > 0) {
        testAccommodationId = accommodationsResponse.body[0]._id;
      }

      // Create test food provider data
      const foodProvidersResponse = await request(app.getHttpServer())
        .get('/food-providers')
        .set('Authorization', `Bearer ${studentToken}`);

      if (foodProvidersResponse.body.length > 0) {
        testFoodProviderId = foodProvidersResponse.body[0]._id;
      }
    }

    it('should get student dashboard summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalBookings');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalSpent');
      expect(response.body).toHaveProperty('recentBookings');
      expect(response.body).toHaveProperty('recentOrders');
      expect(typeof response.body.totalBookings).toBe('number');
      expect(typeof response.body.totalOrders).toBe('number');
      expect(typeof response.body.totalSpent).toBe('number');
      expect(Array.isArray(response.body.recentBookings)).toBe(true);
      expect(Array.isArray(response.body.recentOrders)).toBe(true);
    });

    it('should get student analytics data', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/analytics')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('monthlySpending');
      expect(response.body).toHaveProperty('accommodationSpending');
      expect(response.body).toHaveProperty('foodSpending');
      expect(response.body).toHaveProperty('spendingTrend');
      expect(Array.isArray(response.body.spendingTrend)).toBe(true);
    });
  });

  describe('Student Booking Management', () => {
    beforeEach(async () => {
      // Ensure we have test data
      const accommodationsResponse = await request(app.getHttpServer())
        .get('/accommodations')
        .set('Authorization', `Bearer ${studentToken}`);

      if (accommodationsResponse.body.length > 0) {
        testAccommodationId = accommodationsResponse.body[0]._id;
      }
    });

    it('should create a new accommodation booking', async () => {
      if (!testAccommodationId) {
        console.log('Skipping booking test - no accommodations available');
        return;
      }

      const bookingData = {
        accommodation: testAccommodationId,
        checkIn: '2025-08-01',
        checkOut: '2025-08-05',
        guests: 2,
        totalAmount: 4000,
        specialRequests: 'Need early check-in if possible',
      };

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(bookingData)
        .expect(201);

      testBookingId = response.body._id;
      expect(response.body.user).toBe(studentUser._id);
      expect(response.body.accommodation).toBe(testAccommodationId);
      expect(response.body.status).toBe('pending');
      expect(response.body.totalAmount).toBe(4000);
      expect(response.body.guests).toBe(2);
    });

    it('should get all student bookings', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings/my-bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((booking) => {
        expect(booking).toHaveProperty('_id');
        expect(booking).toHaveProperty('accommodation');
        expect(booking).toHaveProperty('checkIn');
        expect(booking).toHaveProperty('checkOut');
        expect(booking).toHaveProperty('status');
        expect(booking.user).toBe(studentUser._id);
      });
    });

    it('should get specific booking details', async () => {
      if (!testBookingId) {
        console.log('Skipping booking detail test - no booking created');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body._id).toBe(testBookingId);
      expect(response.body.user).toBe(studentUser._id);
      expect(response.body).toHaveProperty('accommodation');
      expect(response.body).toHaveProperty('checkIn');
      expect(response.body).toHaveProperty('checkOut');
    });

    it('should filter bookings by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings/my-bookings?status=pending')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((booking) => {
        expect(booking.status).toBe('pending');
      });
    });

    it('should update booking status (cancel)', async () => {
      if (!testBookingId) {
        console.log('Skipping booking update test - no booking created');
        return;
      }

      const response = await request(app.getHttpServer())
        .put(`/bookings/${testBookingId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(response.body.status).toBe('cancelled');
    });

    it('should validate booking date constraints', async () => {
      if (!testAccommodationId) {
        console.log('Skipping date validation test - no accommodations available');
        return;
      }

      const invalidBookingData = {
        accommodation: testAccommodationId,
        checkIn: '2025-08-10',
        checkOut: '2025-08-05', // Check-out before check-in
        guests: 2,
        totalAmount: 4000,
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidBookingData)
        .expect(400);
    });

    it('should get booking history with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings/my-bookings?page=1&limit=5')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Student Food Order Management', () => {
    beforeEach(async () => {
      // Get available food providers
      const foodProvidersResponse = await request(app.getHttpServer())
        .get('/food-providers')
        .set('Authorization', `Bearer ${studentToken}`);

      if (foodProvidersResponse.body.length > 0) {
        testFoodProviderId = foodProvidersResponse.body[0]._id;
      }
    });

    it('should create a new food order', async () => {
      if (!testFoodProviderId) {
        console.log('Skipping order test - no food providers available');
        return;
      }

      // First get menu items for the food provider
      const menuResponse = await request(app.getHttpServer())
        .get(`/food-providers/${testFoodProviderId}/menu`)
        .set('Authorization', `Bearer ${studentToken}`);

      if (menuResponse.body.length === 0) {
        console.log('Skipping order test - no menu items available');
        return;
      }

      const menuItemId = menuResponse.body[0]._id;
      const orderData = {
        food_provider: testFoodProviderId,
        items: [
          {
            menu_item: menuItemId,
            quantity: 2,
          },
        ],
        delivery_address: 'Student Hostel Room 205',
        special_instructions: 'Please ring the bell',
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(orderData)
        .expect(201);

      testOrderId = response.body._id;
      expect(response.body.user).toBe(studentUser._id);
      expect(response.body.food_provider).toBe(testFoodProviderId);
      expect(response.body.status).toBe('placed');
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].quantity).toBe(2);
    });

    it('should get all student orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/my-orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((order) => {
        expect(order).toHaveProperty('_id');
        expect(order).toHaveProperty('food_provider');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('status');
        expect(order.user).toBe(studentUser._id);
      });
    });

    it('should get specific order details', async () => {
      if (!testOrderId) {
        console.log('Skipping order detail test - no order created');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body._id).toBe(testOrderId);
      expect(response.body.user).toBe(studentUser._id);
      expect(response.body).toHaveProperty('food_provider');
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total_price');
    });

    it('should filter orders by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/my-orders?status=placed')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((order) => {
        expect(order.status).toBe('placed');
      });
    });

    it('should track order status updates', async () => {
      if (!testOrderId) {
        console.log('Skipping order tracking test - no order created');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('estimatedDelivery');
    });

    it('should get order history with date range', async () => {
      const startDate = '2025-06-01';
      const endDate = '2025-12-31';

      const response = await request(app.getHttpServer())
        .get(`/orders/my-orders?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Student Search & Discovery Features', () => {
    it('should search accommodations by location', async () => {
      const response = await request(app.getHttpServer())
        .get('/accommodations?search=Mumbai')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search accommodations by price range', async () => {
      const response = await request(app.getHttpServer())
        .get('/accommodations?minPrice=500&maxPrice=2000')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((accommodation) => {
        expect(accommodation.price).toBeGreaterThanOrEqual(500);
        expect(accommodation.price).toBeLessThanOrEqual(2000);
      });
    });

    it('should find nearby accommodations', async () => {
      const response = await request(app.getHttpServer())
        .get('/accommodations/nearby?lat=19.076&lng=72.8777&radius=10000')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search food providers by cuisine type', async () => {
      const response = await request(app.getHttpServer())
        .get('/food-providers?cuisine=Indian')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get accommodation details with reviews', async () => {
      if (!testAccommodationId) {
        console.log('Skipping accommodation details test - no accommodations available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/accommodations/${testAccommodationId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('amenities');
    });
  });

  describe('Student Reviews & Ratings', () => {
    let testReviewId: string;

    it('should create accommodation review after completed booking', async () => {
      if (!testAccommodationId || !testBookingId) {
        console.log('Skipping review test - missing accommodation or booking');
        return;
      }

      const reviewData = {
        accommodation: testAccommodationId,
        booking: testBookingId,
        rating: 5,
        comment: 'Excellent accommodation! Very clean and well-maintained.',
        categories: {
          cleanliness: 5,
          location: 4,
          amenities: 5,
          value: 4,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/reviews/accommodations')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(reviewData)
        .expect(201);

      testReviewId = response.body._id;
      expect(response.body.user).toBe(studentUser._id);
      expect(response.body.rating).toBe(5);
      expect(response.body.comment).toBe('Excellent accommodation! Very clean and well-maintained.');
    });

    it('should get all student reviews', async () => {
      const response = await request(app.getHttpServer())
        .get('/reviews/my-reviews')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((review) => {
        expect(review).toHaveProperty('rating');
        expect(review).toHaveProperty('comment');
        expect(review.user).toBe(studentUser._id);
      });
    });

    it('should update existing review', async () => {
      if (!testReviewId) {
        console.log('Skipping review update test - no review created');
        return;
      }

      const updateData = {
        rating: 4,
        comment: 'Good accommodation, but room for improvement.',
        categories: {
          cleanliness: 4,
          location: 4,
          amenities: 4,
          value: 4,
        },
      };

      const response = await request(app.getHttpServer())
        .put(`/reviews/${testReviewId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.rating).toBe(4);
      expect(response.body.comment).toBe('Good accommodation, but room for improvement.');
    });

    it('should delete review', async () => {
      if (!testReviewId) {
        console.log('Skipping review deletion test - no review created');
        return;
      }

      await request(app.getHttpServer())
        .delete(`/reviews/${testReviewId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      // Verify review is deleted
      await request(app.getHttpServer())
        .get(`/reviews/${testReviewId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('Student Notifications', () => {
    it('should get student notifications', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((notification) => {
        expect(notification).toHaveProperty('title');
        expect(notification).toHaveProperty('message');
        expect(notification).toHaveProperty('read');
        expect(notification).toHaveProperty('createdAt');
      });
    });

    it('should get unread notifications count', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });

    it('should mark notification as read', async () => {
      // First get notifications
      const notificationsResponse = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      if (notificationsResponse.body.length > 0) {
        const notificationId = notificationsResponse.body[0]._id;

        const response = await request(app.getHttpServer())
          .put(`/notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        expect(response.body.read).toBe(true);
      }
    });

    it('should mark all notifications as read', async () => {
      const response = await request(app.getHttpServer())
        .put('/notifications/mark-all-read')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.message).toBe('All notifications marked as read');
    });
  });

  describe('Error Handling & Security', () => {
    it('should reject access without authentication', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);

      await request(app.getHttpServer())
        .get('/bookings/my-bookings')
        .expect(401);

      await request(app.getHttpServer())
        .get('/orders/my-orders')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      const invalidToken = 'invalid.jwt.token';

      await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });

    it('should prevent accessing other users data', async () => {
      const otherUserId = '507f1f77bcf86cd799439999';

      await request(app.getHttpServer())
        .get(`/users/${otherUserId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should validate input data for bookings', async () => {
      const invalidBookingData = {
        accommodation: 'invalid-id',
        checkIn: 'invalid-date',
        checkOut: '2025-08-05',
        guests: -1,
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidBookingData)
        .expect(400);
    });

    it('should validate input data for orders', async () => {
      const invalidOrderData = {
        food_provider: 'invalid-id',
        items: [],
        delivery_address: '',
      };

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidOrderData)
        .expect(400);
    });

    it('should handle non-existent resource requests', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      await request(app.getHttpServer())
        .get(`/accommodations/${nonExistentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/bookings/${nonExistentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/orders/${nonExistentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('Performance & Load Testing', () => {
    it('should handle multiple concurrent requests', async () => {
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .get('/accommodations')
          .set('Authorization', `Bearer ${studentToken}`)
      );

      const responses = await Promise.all(concurrentRequests);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/users/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should handle pagination efficiently', async () => {
      const response = await request(app.getHttpServer())
        .get('/accommodations?page=1&limit=50')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Data Consistency & Integrity', () => {
    it('should maintain data consistency across related entities', async () => {
      if (!testBookingId) {
        console.log('Skipping consistency test - no booking available');
        return;
      }

      // Get booking details
      const bookingResponse = await request(app.getHttpServer())
        .get(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      if (bookingResponse.status === 200) {
        const booking = bookingResponse.body;
        
        // Get accommodation details
        const accommodationResponse = await request(app.getHttpServer())
          .get(`/accommodations/${booking.accommodation}`)
          .set('Authorization', `Bearer ${studentToken}`);

        expect(accommodationResponse.status).toBe(200);
        expect(accommodationResponse.body._id).toBe(booking.accommodation);
      }
    });

    it('should calculate totals correctly', async () => {
      if (!testOrderId) {
        console.log('Skipping total calculation test - no order available');
        return;
      }

      const orderResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      if (orderResponse.status === 200) {
        const order = orderResponse.body;
        
        // Calculate expected total from items
        let expectedTotal = 0;
        for (const item of order.items) {
          expectedTotal += item.menu_item.price * item.quantity;
        }

        expect(order.total_price).toBe(expectedTotal);
      }
    });
  });
});
