# StayKaru Image Upload Implementation Plan

## 📋 Overview
Comprehensive plan to implement image upload functionality for landlords (accommodation photos) and food providers (restaurant/menu item photos).

## 🛠 Technical Stack
- **Upload Handler**: Multer (NestJS built-in)
- **Storage**: Local filesystem + optional cloud (Cloudinary/AWS S3)
- **Image Processing**: Sharp (resize, optimize, thumbnails)
- **Validation**: File type, size, dimensions
- **Security**: Sanitization, virus scanning

## 📁 Implementation Phases

### Phase 1: Core Infrastructure (Priority: High)
1. **Install Dependencies**
   ```bash
   npm install multer @types/multer sharp cloudinary
   ```

2. **Create File Upload Module**
   - FileUploadService
   - FileUploadController
   - Image processing utilities
   - Storage configuration

3. **Update Database Schemas**
   - Add images array to Accommodation
   - Add images array to FoodProvider  
   - Add image field to MenuItem
   - Image metadata schema

### Phase 2: Schema Updates (Priority: High)
```typescript
// Accommodation Schema
@Prop({ type: [String], default: [] })
images: string[]; // Array of image URLs

// FoodProvider Schema  
@Prop({ type: [String], default: [] })
images: string[]; // Restaurant photos

// MenuItem Schema
@Prop({ type: String })
image?: string; // Single menu item photo
```

### Phase 3: API Endpoints (Priority: High)
```
POST /upload/accommodation/:id/images
POST /upload/food-provider/:id/images  
POST /upload/menu-item/:id/image
DELETE /upload/image/:imageId
GET /images/:filename
```

### Phase 4: Features (Priority: Medium)
- Image resizing (multiple sizes)
- Thumbnail generation
- Image optimization
- Bulk upload support
- Image reordering

### Phase 5: Security & Validation (Priority: High)
- File type validation (JPEG, PNG, WebP)
- File size limits (max 5MB per image)
- Image dimension validation
- Malware scanning
- Rate limiting

## 🗂 File Structure
```
src/
├── modules/
│   ├── file-upload/
│   │   ├── file-upload.module.ts
│   │   ├── file-upload.service.ts
│   │   ├── file-upload.controller.ts
│   │   ├── dto/upload-image.dto.ts
│   │   └── interfaces/image-metadata.interface.ts
│   ├── accommodation/
│   │   └── (updated with image endpoints)
│   └── food_service/
│       └── (updated with image endpoints)
├── shared/
│   ├── guards/file-upload.guard.ts
│   ├── pipes/image-validation.pipe.ts
│   └── utils/image-processing.util.ts
└── uploads/ (local storage)
    ├── accommodations/
    ├── food-providers/
    └── menu-items/
```

## 🔄 Implementation Steps

### Step 1: Create File Upload Infrastructure
1. Create FileUploadModule
2. Configure Multer for file handling
3. Set up image processing with Sharp
4. Create storage utilities

### Step 2: Update Existing Schemas
1. Add image fields to schemas
2. Update DTOs for image handling
3. Migrate existing data

### Step 3: Create Upload Endpoints
1. Accommodation image upload
2. Food provider image upload
3. Menu item image upload
4. Image deletion endpoints

### Step 4: Integrate with Existing Controllers
1. Update accommodation creation/edit
2. Update food provider creation/edit
3. Update menu item creation/edit

### Step 5: Frontend Integration Points
```typescript
// Form data for image upload
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

// API call
await api.post('/upload/accommodation/123/images', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

## 🎨 User Experience Flow

### For Landlords:
1. Create accommodation with basic info
2. Upload multiple property photos
3. Reorder images (set main photo)
4. Edit/delete individual images

### For Food Providers:
1. Create restaurant profile
2. Upload restaurant photos
3. Add menu items with individual photos
4. Manage image gallery

## 📊 Storage Strategy

### Option 1: Local Storage (Immediate)
- Store in `/uploads` directory
- Serve via static file middleware
- Good for development/testing

### Option 2: Cloud Storage (Production)
- Cloudinary for image optimization
- AWS S3 for scalability
- CDN for global delivery

## 🔒 Security Considerations
1. **File Validation**: Strict MIME type checking
2. **Size Limits**: Max 5MB per image, 10 images per listing
3. **Sanitization**: Remove EXIF data, potential malware
4. **Access Control**: Only owners can upload/delete images
5. **Rate Limiting**: Prevent spam uploads

## 🚀 Quick Start Implementation
Would you like me to:
1. ✅ Start with Phase 1 (Core Infrastructure)?
2. ✅ Update the schemas first?
3. ✅ Create the file upload module?
4. ✅ All of the above in sequence?

## 📈 Benefits
- ✅ Enhanced user experience
- ✅ Increased listing attractiveness  
- ✅ Better conversion rates
- ✅ Professional appearance
- ✅ Competitive advantage

## ⏱ Estimated Timeline
- **Phase 1-2**: 1-2 days (Infrastructure + Schemas)
- **Phase 3**: 1 day (API Endpoints)
- **Phase 4-5**: 1 day (Features + Security)
- **Total**: 3-4 days for complete implementation
