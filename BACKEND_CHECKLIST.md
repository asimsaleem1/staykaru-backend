# ✅ Backend Implementation Checklist
## StayKaru Admin Approval System

### 🎯 Quick Reference Guide

#### Phase 1: Database Schema ⏱️ Est. 30 minutes
- [ ] Update `models/Accommodation.js` - Add approval fields
- [ ] Update `models/FoodProvider.js` - Add approval fields  
- [ ] Create migration script `migrations/add_approval_fields.js`
- [ ] Run migration to update existing records
- [ ] Test database schema changes

#### Phase 2: Admin API Endpoints ⏱️ Est. 2 hours
- [ ] Create `routes/admin/accommodations.js`
  - [ ] POST `/:id/approve` endpoint
  - [ ] POST `/:id/reject` endpoint
  - [ ] PUT `/:id` endpoint (general update)
  - [ ] GET `/` endpoint (admin view all)
- [ ] Create `routes/admin/foodProviders.js`
  - [ ] POST `/:id/approve` endpoint
  - [ ] POST `/:id/reject` endpoint
  - [ ] PUT `/:id` endpoint (general update)
  - [ ] GET `/` endpoint (admin view all)

#### Phase 3: Student API Updates ⏱️ Est. 1 hour
- [ ] Update `routes/accommodations.js`
  - [ ] Add approval status filters
  - [ ] Set default filter for students (approved only)
- [ ] Update `routes/foodProviders.js`
  - [ ] Add approval status filters
  - [ ] Set default filter for students (approved only)

#### Phase 4: Authentication ⏱️ Est. 30 minutes
- [ ] Update `middleware/auth.js` - Add `authenticateAdmin` function
- [ ] Register admin routes in `app.js`/`server.js`
- [ ] Test admin authentication

#### Phase 5: Testing ⏱️ Est. 1 hour
- [ ] Create test file `tests/admin-approval.test.js`
- [ ] Run manual tests with curl/Postman
- [ ] Use frontend test tools to verify endpoints
- [ ] End-to-end testing

#### Phase 6: Deployment ⏱️ Est. 30 minutes
- [ ] Run database migration in production
- [ ] Deploy backend changes
- [ ] Verify frontend integration
- [ ] Monitor logs for issues

---

## 🚀 Quick Start Commands

```bash
# 1. Database Migration
node migrations/add_approval_fields.js

# 2. Test Endpoints
npm test

# 3. Start Development Server
npm run dev

# 4. Test with Frontend
# Use "Test API Endpoints" button in admin screens
```

---

## 📋 Required API Endpoints Summary

### Admin Endpoints:
```
POST /api/admin/accommodations/:id/approve
POST /api/admin/accommodations/:id/reject
PUT  /api/admin/accommodations/:id
GET  /api/admin/accommodations

POST /api/admin/food-providers/:id/approve
POST /api/admin/food-providers/:id/reject
PUT  /api/admin/food-providers/:id
GET  /api/admin/food-providers
```

### Student Endpoints (Updated):
```
GET /api/accommodations?status=approved&adminApproved=true&visibleToStudents=true
GET /api/food-providers?status=approved&adminApproved=true&visibleToStudents=true
```

---

## 🔧 Database Fields to Add

```javascript
// Add to both Accommodation and FoodProvider models:
approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
isActive: { type: Boolean, default: false }
adminApproved: { type: Boolean, default: false }
visibleToStudents: { type: Boolean, default: false }
approvedBy: { type: ObjectId, ref: 'User' }
approvedAt: { type: Date }
rejectedBy: { type: ObjectId, ref: 'User' }
rejectedAt: { type: Date }
rejectionReason: { type: String }
```

---

## ⚡ Priority Order

1. **Phase 1** (Database) - Required for everything else
2. **Phase 2** (Admin APIs) - Core approval functionality  
3. **Phase 3** (Student APIs) - Student safety
4. **Phase 4** (Auth) - Security
5. **Phase 5** (Testing) - Quality assurance
6. **Phase 6** (Deploy) - Go live

---

## 🆘 Need Help?

- Full implementation guide: `BACKEND_IMPLEMENTATION_WORKFLOW.md`
- Code templates: `backend-implementation-template.js`
- Frontend test tools: Admin screens → "Test API Endpoints" button
- Test script: `node test-admin-approval.js`

**Total Estimated Time: 5 hours** ⏱️
