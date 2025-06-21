import { Injectable, BadRequestException } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileUploadConfig implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadType = this.getUploadType(req.url);
          const uploadPath = path.join(process.cwd(), 'uploads', uploadType);
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueFileName = this.generateUniqueFilename(file.originalname);
          cb(null, uniqueFileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (this.validateFile(file)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type or size'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10, // Maximum 10 files per upload
      },
    };
  }

  private getUploadType(url: string): string {
    if (url.includes('accommodation')) return 'accommodations';
    if (url.includes('food-provider')) return 'food-providers';
    if (url.includes('menu-item')) return 'menu-items';
    return 'general';
  }  private validateFile(file: any): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file || typeof file !== 'object') return false;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const mimetype = file.mimetype as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access  
    const size = file.size as number;

    return (
      mimetype &&
      allowedMimeTypes.includes(mimetype) &&
      size &&
      size <= maxSize
    );
  }

  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
    return `${name}_${timestamp}_${random}${ext}`;
  }
}
