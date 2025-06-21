import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ImageProcessingUtil } from '../../shared/utils/image-processing.util';
import {
  ImageMetadata,
  UploadResult,
  ImageProcessingOptions,
} from './interfaces/image-metadata.interface';

@Injectable()
export class FileUploadService {
  constructor(private readonly imageProcessingUtil: ImageProcessingUtil) {}

  async uploadImages(
    files: Express.Multer.File[],
    options: ImageProcessingOptions = {},
  ): Promise<UploadResult> {
    const results: ImageMetadata[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Validate file
        this.imageProcessingUtil.validateImageFile(file);        // Process and optimize the image
        const processedImage = await this.imageProcessingUtil.processImage(
          file.path,
          file.path, // Overwrite original with optimized version
          options,
        );

        results.push(processedImage);
      } catch (error: any) {
        errors.push(
          `Failed to process ${file.originalname}: ${
            error?.message || error || 'Unknown error'
          }`,
        );

        // Clean up the failed file
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }
      }
    }

    return {
      success: errors.length === 0,
      images: results,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async uploadSingleImage(
    file: Express.Multer.File,
    options: ImageProcessingOptions = {},
  ): Promise<ImageMetadata> {
    const result = await this.uploadImages([file], options);

    if (!result.success || result.images.length === 0) {
      throw new BadRequestException(
        result.errors?.[0] || 'Failed to upload image',
      );
    }

    return result.images[0];
  }

  async deleteImage(filename: string, uploadType: string): Promise<void> {
    const imagePath = path.join(process.cwd(), 'uploads', uploadType, filename);

    try {
      await this.imageProcessingUtil.deleteImage(imagePath);
    } catch {
      throw new NotFoundException(`Image not found: ${filename}`);
    }
  }

  async deleteMultipleImages(
    filenames: string[],
    uploadType: string,
  ): Promise<void> {
    const deletePromises = filenames.map((filename) =>
      this.deleteImage(filename, uploadType).catch((error) =>
        console.error(`Failed to delete ${filename}:`, error),
      ),
    );

    await Promise.all(deletePromises);
  }

  getImageUrl(filename: string, uploadType: string): string {
    return `/images/${uploadType}/${filename}`;
  }

  getImagePath(filename: string, uploadType: string): string {
    return path.join(process.cwd(), 'uploads', uploadType, filename);
  }

  async imageExists(filename: string, uploadType: string): Promise<boolean> {
    const imagePath = this.getImagePath(filename, uploadType);
    try {
      await fs.access(imagePath);
      return true;
    } catch {
      return false;
    }
  }

  extractFilenameFromUrl(url: string): string {
    return path.basename(url);
  }

  validateImageLimit(
    currentCount: number,
    newCount: number,
    maxLimit: number = 10,
  ): void {
    if (currentCount + newCount > maxLimit) {
      throw new BadRequestException(
        `Cannot upload ${newCount} images. Maximum ${maxLimit} images allowed. Current count: ${currentCount}`,
      );
    }
  }

  generateImageUrls(filenames: string[], uploadType: string): string[] {
    return filenames.map((filename) =>
      this.getImageUrl(filename, uploadType),
    );
  }
}
