import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ImageProcessingOptions, ImageMetadata } from '../../modules/file-upload/interfaces/image-metadata.interface';

@Injectable()
export class ImageProcessingUtil {
  async processImage(
    inputPath: string,
    outputPath: string,
    options: ImageProcessingOptions = {},
  ): Promise<ImageMetadata> {
    const {
      resize,
      quality = 85,
      format = 'jpeg',
      generateThumbnail = true,
    } = options;

    let processor = sharp(inputPath);

    // Apply resize if specified
    if (resize) {
      processor = processor.resize(resize.width, resize.height, {
        fit: resize.fit || 'cover',
        withoutEnlargement: true,
      });
    }

    // Apply quality and format
    if (format === 'jpeg') {
      processor = processor.jpeg({ quality });
    } else if (format === 'png') {
      processor = processor.png({ quality });
    } else if (format === 'webp') {
      processor = processor.webp({ quality });
    }

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    
    // Save processed image
    await processor.toFile(outputPath);

    // Generate thumbnail if requested
    if (generateThumbnail) {
      const thumbnailPath = this.getThumbnailPath(outputPath);
      await sharp(inputPath)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    }

    const stats = await fs.stat(outputPath);
    const filename = path.basename(outputPath);

    return {
      originalName: path.basename(inputPath),
      filename,
      mimetype: `image/${format}`,
      size: stats.size,
      path: outputPath,
      url: `/images/${filename}`,
      uploadedAt: new Date(),
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0,
      },
    };
  }

  async optimizeImage(inputPath: string, outputPath: string): Promise<void> {
    await sharp(inputPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
  }

  async createThumbnail(inputPath: string, outputPath: string): Promise<void> {
    await sharp(inputPath)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  }

  getThumbnailPath(imagePath: string): string {
    const dir = path.dirname(imagePath);
    const ext = path.extname(imagePath);
    const name = path.basename(imagePath, ext);
    return path.join(dir, `${name}_thumb${ext}`);
  }

  async deleteImage(imagePath: string): Promise<void> {
    try {
      await fs.unlink(imagePath);
      
      // Also delete thumbnail if it exists
      const thumbnailPath = this.getThumbnailPath(imagePath);
      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // Thumbnail might not exist, ignore error
      }
    } catch (error) {
      console.error(`Failed to delete image: ${imagePath}`, error);
      throw error;
    }
  }

  validateImageFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }

    return true;
  }

  generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    return `${name}_${timestamp}_${random}${ext}`;
  }
}
