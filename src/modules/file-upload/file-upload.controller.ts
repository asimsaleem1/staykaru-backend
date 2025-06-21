import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import { FileUploadService } from './file-upload.service';
import {
  UploadImageDto,
  UploadSingleImageDto,
  DeleteImageDto,
} from './dto/upload-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('file-upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('accommodation/:id/images')
  @ApiOperation({ summary: 'Upload images for accommodation' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadAccommodationImages(
    @Param('id') accommodationId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const result = await this.fileUploadService.uploadImages(files, {
      resize: { width: 1200, height: 800, fit: 'cover' },
      quality: 85,
      generateThumbnail: true,
    });

    return {
      message: 'Images uploaded successfully',
      accommodationId,
      images: result.images,
      errors: result.errors,
    };
  }

  @Post('food-provider/:id/images')
  @ApiOperation({ summary: 'Upload images for food provider' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadFoodProviderImages(
    @Param('id') providerId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const result = await this.fileUploadService.uploadImages(files, {
      resize: { width: 1000, height: 800, fit: 'cover' },
      quality: 85,
      generateThumbnail: true,
    });

    return {
      message: 'Images uploaded successfully',
      providerId,
      images: result.images,
      errors: result.errors,
    };
  }

  @Post('menu-item/:id/image')
  @ApiOperation({ summary: 'Upload image for menu item' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @UseInterceptors(FileInterceptor('image'))
  async uploadMenuItemImage(
    @Param('id') menuItemId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.fileUploadService.uploadSingleImage(file, {
      resize: { width: 600, height: 400, fit: 'cover' },
      quality: 85,
      generateThumbnail: true,
    });

    return {
      message: 'Image uploaded successfully',
      menuItemId,
      image: result,
    };
  }

  @Delete('image/:uploadType/:filename')
  @ApiOperation({ summary: 'Delete an uploaded image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deleteImage(
    @Param('uploadType') uploadType: string,
    @Param('filename') filename: string,
  ) {
    await this.fileUploadService.deleteImage(filename, uploadType);
    return {
      message: 'Image deleted successfully',
      filename,
    };
  }

  @Get('images/:uploadType/:filename')
  @ApiOperation({ summary: 'Serve uploaded images' })
  async serveImage(
    @Param('uploadType') uploadType: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const imagePath = this.fileUploadService.getImagePath(filename, uploadType);

    try {
      return res.sendFile(path.resolve(imagePath));
    } catch (error) {
      throw new BadRequestException('Image not found');
    }
  }

  @Get('images/:uploadType/:filename/thumbnail')
  @ApiOperation({ summary: 'Serve thumbnail images' })
  async serveThumbnail(
    @Param('uploadType') uploadType: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const imagePath = this.fileUploadService.getImagePath(filename, uploadType);
    const thumbnailPath = path.join(
      path.dirname(imagePath),
      `${path.basename(imagePath, path.extname(imagePath))}_thumb${path.extname(imagePath)}`,
    );

    try {
      return res.sendFile(path.resolve(thumbnailPath));
    } catch (error) {
      throw new BadRequestException('Thumbnail not found');
    }
  }
}
