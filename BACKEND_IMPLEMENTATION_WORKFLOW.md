# 🚀 Backend Implementation Workflow Guide
## StayKaru Admin Approval System

### 📋 Overview
This document provides step-by-step instructions for implementing the backend changes required to support the complete admin approval workflow in StayKaru.

---

## 🎯 Implementation Checklist

### Phase 1: Database Schema Updates ✅
### Phase 2: Admin API Endpoints ✅  
### Phase 3: Student-Facing API Updates ✅
### Phase 4: Authentication & Authorization ✅
### Phase 5: Testing & Validation ✅

---

## 📊 Phase 1: Database Schema Updates

### 1.1 Update Accommodation Model

**File:** `models/Accommodation.js` (or equivalent)

```javascript
// Add these fields to your existing Accommodation schema
const accommodationSchema = new mongoose.Schema({
  // ...existing fields...
  
  // ===== NEW ADMIN APPROVAL FIELDS =====
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: false  // Only true after admin approval
  },
  adminApproved: {
    type: Boolean,
    default: false
  },
  visibleToStudents: {
    type: Boolean,
    default: false  // Only true after admin approval
  },
  
  // Admin approval metadata
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  
  // Admin rejection metadata
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
  
  // ...existing fields...
});
```

### 1.2 Update Food Provider Model

**File:** `models/FoodProvider.js` (or equivalent)

```javascript
// Add the SAME fields to your existing FoodProvider schema
const foodProviderSchema = new mongoose.Schema({
  // ...existing fields...
  
  // ===== NEW ADMIN APPROVAL FIELDS =====
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: false  // Only true after admin approval
  },
  adminApproved: {
    type: Boolean,
    default: false
  },
  visibleToStudents: {
    type: Boolean,
    default: false  // Only true after admin approval
  },
  
  // Admin approval metadata (same as accommodation)
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
  
  // ...existing fields...
});
```

### 1.3 Database Migration Script

**File:** `migrations/add_approval_fields.js`

```javascript
// Migration script to update existing records
const mongoose = require('mongoose');
const Accommodation = require('../models/Accommodation');
const FoodProvider = require('../models/FoodProvider');

async function migrateApprovalFields() {
  try {
    console.log('🔄 Starting approval fields migration...');
    
    // Update existing accommodations
    await Accommodation.updateMany(
      { approvalStatus: { $exists: false } },
      {
        $set: {
          approvalStatus: 'pending',
          isActive: false,
          adminApproved: false,
          visibleToStudents: false
        }
      }
    );
    
    // Update existing food providers
    await FoodProvider.updateMany(
      { approvalStatus: { $exists: false } },
      {
        $set: {
          approvalStatus: 'pending',
          isActive: false,
          adminApproved: false,
          visibleToStudents: false
        }
      }
    );
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

module.exports = { migrateApprovalFields };
```

---

## 🔐 Phase 2: Admin API Endpoints

### 2.1 Admin Accommodation Approval Routes

**File:** `routes/admin/accommodations.js`

```javascript
const express = require('express');
const router = express.Router();
const Accommodation = require('../../models/Accommodation');
const { authenticateAdmin } = require('../../middleware/auth');

// ===== ACCOMMODATION APPROVAL ENDPOINTS =====

// Admin approves accommodation
router.post('/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const accommodation = await Accommodation.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'approved',
        isActive: true,
        adminApproved: true,
        visibleToStudents: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        // Clear any previous rejection data
        $unset: { 
          rejectedBy: 1, 
          rejectedAt: 1, 
          rejectionReason: 1 
        }
      },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!accommodation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Accommodation not found' 
      });
    }

    // Optional: Send notification to landlord
    // await notificationService.sendApprovalNotification(accommodation.owner, 'accommodation');

    res.status(200).json({
      success: true,
      message: 'Accommodation approved successfully',
      data: accommodation
    });
    
    console.log(`✅ Admin ${req.user.name} approved accommodation ${id}`);
  } catch (error) {
    console.error('❌ Error approving accommodation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve accommodation',
      error: error.message 
    });
  }
});

// Admin rejects accommodation
router.post('/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    const accommodation = await Accommodation.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'rejected',
        isActive: false,
        adminApproved: false,
        visibleToStudents: false,
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'No reason provided',
        // Clear any previous approval data
        $unset: { 
          approvedBy: 1, 
          approvedAt: 1 
        }
      },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!accommodation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Accommodation not found' 
      });
    }

    // Optional: Send notification to landlord
    // await notificationService.sendRejectionNotification(accommodation.owner, 'accommodation', rejectionReason);

    res.status(200).json({
      success: true,
      message: 'Accommodation rejected successfully',
      data: accommodation
    });
    
    console.log(`❌ Admin ${req.user.name} rejected accommodation ${id}: ${rejectionReason}`);
  } catch (error) {
    console.error('❌ Error rejecting accommodation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject accommodation',
      error: error.message 
    });
  }
});

// General admin update endpoint (supports both approve/reject via PUT)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const adminId = req.user.id;

    // Add admin metadata based on approval status
    if (updateData.approvalStatus === 'approved') {
      updateData.adminApproved = true;
      updateData.visibleToStudents = true;
      updateData.isActive = true;
      updateData.approvedBy = adminId;
      updateData.approvedAt = new Date();
    } else if (updateData.approvalStatus === 'rejected') {
      updateData.adminApproved = false;
      updateData.visibleToStudents = false;
      updateData.isActive = false;
      updateData.rejectedBy = adminId;
      updateData.rejectedAt = new Date();
    }

    const accommodation = await Accommodation.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!accommodation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Accommodation not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Accommodation updated successfully',
      data: accommodation
    });
  } catch (error) {
    console.error('❌ Error updating accommodation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update accommodation',
      error: error.message 
    });
  }
});

// Get all accommodations for admin (including pending)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const accommodations = await Accommodation.find({})
      .populate('owner', 'name email phone')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 });

    const stats = {
      total: accommodations.length,
      pending: accommodations.filter(acc => acc.approvalStatus === 'pending').length,
      approved: accommodations.filter(acc => acc.approvalStatus === 'approved').length,
      rejected: accommodations.filter(acc => acc.approvalStatus === 'rejected').length,
      active: accommodations.filter(acc => acc.isActive).length
    };

    res.status(200).json({
      success: true,
      data: accommodations,
      stats,
      count: accommodations.length
    });
  } catch (error) {
    console.error('❌ Error fetching admin accommodations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch accommodations',
      error: error.message 
    });
  }
});

module.exports = router;
```

### 2.2 Admin Food Provider Approval Routes

**File:** `routes/admin/foodProviders.js`

```javascript
const express = require('express');
const router = express.Router();
const FoodProvider = require('../../models/FoodProvider');
const { authenticateAdmin } = require('../../middleware/auth');

// ===== FOOD PROVIDER APPROVAL ENDPOINTS =====
// (Same structure as accommodations - copy the above patterns and replace 'Accommodation' with 'FoodProvider')

// Admin approves food provider
router.post('/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const foodProvider = await FoodProvider.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'approved',
        isActive: true,
        adminApproved: true,
        visibleToStudents: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        $unset: { rejectedBy: 1, rejectedAt: 1, rejectionReason: 1 }
      },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!foodProvider) {
      return res.status(404).json({ 
        success: false, 
        message: 'Food provider not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food provider approved successfully',
      data: foodProvider
    });
    
    console.log(`✅ Admin ${req.user.name} approved food provider ${id}`);
  } catch (error) {
    console.error('❌ Error approving food provider:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve food provider',
      error: error.message 
    });
  }
});

// Admin rejects food provider
router.post('/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    const foodProvider = await FoodProvider.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'rejected',
        isActive: false,
        adminApproved: false,
        visibleToStudents: false,
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'No reason provided',
        $unset: { approvedBy: 1, approvedAt: 1 }
      },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!foodProvider) {
      return res.status(404).json({ 
        success: false, 
        message: 'Food provider not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food provider rejected successfully',
      data: foodProvider
    });
    
    console.log(`❌ Admin ${req.user.name} rejected food provider ${id}: ${rejectionReason}`);
  } catch (error) {
    console.error('❌ Error rejecting food provider:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject food provider',
      error: error.message 
    });
  }
});

// PUT and GET endpoints follow the same pattern as accommodations...

module.exports = router;
```

---

## 👥 Phase 3: Student-Facing API Updates

### 3.1 Update Accommodation Routes for Students

**File:** `routes/accommodations.js`

```javascript
// Update your existing accommodations GET endpoint
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      adminApproved, 
      visibleToStudents, 
      page = 1, 
      limit = 10,
      // ...other existing query params
    } = req.query;
    
    // Build filter object
    let filter = {};
    
    // If specific admin approval filters are requested
    if (status === 'approved') {
      filter.approvalStatus = 'approved';
    }
    if (adminApproved === 'true') {
      filter.adminApproved = true;
    }
    if (visibleToStudents === 'true') {
      filter.visibleToStudents = true;
    }
    
    // DEFAULT FILTER FOR STUDENTS: Only show approved, active accommodations
    if (Object.keys(filter).length === 0) {
      filter = {
        approvalStatus: 'approved',
        adminApproved: true,
        visibleToStudents: true,
        isActive: true
      };
    }
    
    // ...existing filtering logic (price, location, etc.)
    
    const accommodations = await Accommodation.find(filter)
      .populate('owner', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Accommodation.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: accommodations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching accommodations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch accommodations',
      error: error.message 
    });
  }
});
```

### 3.2 Update Food Provider Routes for Students

**File:** `routes/foodProviders.js`

```javascript
// Update your existing food providers GET endpoint (same pattern as accommodations)
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      adminApproved, 
      visibleToStudents, 
      page = 1, 
      limit = 10,
      // ...other existing query params
    } = req.query;
    
    // Build filter object
    let filter = {};
    
    // If specific admin approval filters are requested
    if (status === 'approved') {
      filter.approvalStatus = 'approved';
    }
    if (adminApproved === 'true') {
      filter.adminApproved = true;
    }
    if (visibleToStudents === 'true') {
      filter.visibleToStudents = true;
    }
    
    // DEFAULT FILTER FOR STUDENTS: Only show approved, active food providers
    if (Object.keys(filter).length === 0) {
      filter = {
        approvalStatus: 'approved',
        adminApproved: true,
        visibleToStudents: true,
        isActive: true
      };
    }
    
    const foodProviders = await FoodProvider.find(filter)
      .populate('owner', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await FoodProvider.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: foodProviders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching food providers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch food providers',
      error: error.message 
    });
  }
});
```

---

## 🔐 Phase 4: Authentication & Authorization

### 4.1 Admin Authentication Middleware

**File:** `middleware/auth.js`

```javascript
// Add or update your admin authentication middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Admin authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.',
      error: error.message 
    });
  }
};

module.exports = { authenticateAdmin };
```

### 4.2 Route Registration

**File:** `app.js` or `server.js`

```javascript
// Register admin routes
app.use('/api/admin/accommodations', require('./routes/admin/accommodations'));
app.use('/api/admin/food-providers', require('./routes/admin/foodProviders'));

// Existing routes
app.use('/api/accommodations', require('./routes/accommodations'));
app.use('/api/food-providers', require('./routes/foodProviders'));
```

---

## 🧪 Phase 5: Testing & Validation

### 5.1 Test Script

**File:** `tests/admin-approval.test.js`

```javascript
const request = require('supertest');
const app = require('../app');
const Accommodation = require('../models/Accommodation');
const FoodProvider = require('../models/FoodProvider');

describe('Admin Approval System', () => {
  let adminToken;
  let accommodationId;
  let foodProviderId;

  beforeAll(async () => {
    // Setup test data and get admin token
    adminToken = 'your-admin-jwt-token';
    
    // Create test accommodation
    const accommodation = await Accommodation.create({
      title: 'Test Accommodation',
      description: 'Test description',
      // ...other required fields
    });
    accommodationId = accommodation._id;

    // Create test food provider
    const foodProvider = await FoodProvider.create({
      name: 'Test Food Provider',
      description: 'Test description',
      // ...other required fields
    });
    foodProviderId = foodProvider._id;
  });

  describe('Accommodation Approval', () => {
    test('Admin can approve accommodation', async () => {
      const response = await request(app)
        .post(`/api/admin/accommodations/${accommodationId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.approvalStatus).toBe('approved');
      expect(response.body.data.adminApproved).toBe(true);
      expect(response.body.data.visibleToStudents).toBe(true);
    });

    test('Students can see approved accommodation', async () => {
      const response = await request(app)
        .get('/api/accommodations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const accommodation = response.body.data.find(acc => acc._id === accommodationId);
      expect(accommodation).toBeDefined();
      expect(accommodation.approvalStatus).toBe('approved');
    });
  });

  describe('Food Provider Approval', () => {
    test('Admin can approve food provider', async () => {
      const response = await request(app)
        .post(`/api/admin/food-providers/${foodProviderId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.approvalStatus).toBe('approved');
    });
  });
});
```

### 5.2 Manual Testing Checklist

```bash
# 1. Test admin approval endpoints
curl -X POST "http://localhost:5000/api/admin/accommodations/ACCOMMODATION_ID/approve" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 2. Test student visibility
curl -X GET "http://localhost:5000/api/accommodations?status=approved"

# 3. Test admin dashboard data
curl -X GET "http://localhost:5000/api/admin/accommodations" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 4. Test food provider approval
curl -X POST "http://localhost:5000/api/admin/food-providers/PROVIDER_ID/approve" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🚀 Deployment Steps

### Step 1: Database Migration
```bash
# Run the migration script
node migrations/add_approval_fields.js
```

### Step 2: Update Environment Variables
```bash
# Add to .env file if needed
JWT_SECRET=your-jwt-secret
ADMIN_EMAIL=admin@stayKaru.com
```

### Step 3: Deploy Backend
```bash
# Test locally first
npm test

# Deploy to staging
git add .
git commit -m "feat: implement admin approval system"
git push origin staging

# Deploy to production
git push origin main
```

### Step 4: Verify Integration
1. Use the frontend test tools (`Test API Endpoints` button)
2. Check admin dashboard functionality
3. Verify student screens show only approved items
4. Test approval/rejection workflow end-to-end

---

## 📞 Support & Troubleshooting

### Common Issues:

1. **403 Forbidden on Admin Routes**
   - Check admin authentication middleware
   - Verify JWT token and user role

2. **Students See Unapproved Items**
   - Check default filters in student endpoints
   - Verify database migration ran successfully

3. **Frontend Shows API Errors**
   - Use built-in frontend test tools
   - Check endpoint URLs and response formats

### Need Help?
- Review the frontend implementation files for expected API responses
- Use the provided test script to verify endpoints
- Check console logs for detailed error messages

---

## ✅ Implementation Complete!

Once all phases are implemented:
- Admins will have full control over item visibility
- Students will only see approved, verified items
- Complete audit trail of all approvals/rejections
- Robust error handling and fallback mechanisms

The frontend is already ready and will work seamlessly once these backend changes are deployed! 🎉
