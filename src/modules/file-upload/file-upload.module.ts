import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { ImageProcessingUtil } from '../../shared/utils/image-processing.util';
import { FileUploadConfig } from '../../shared/config/file-upload.config';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: FileUploadConfig,
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService, ImageProcessingUtil, FileUploadConfig],
  exports: [FileUploadService, ImageProcessingUtil],
})
export class FileUploadModule {}
