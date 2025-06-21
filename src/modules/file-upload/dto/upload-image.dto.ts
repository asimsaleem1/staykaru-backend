import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Image files to upload',
  })
  @IsArray()
  images: Express.Multer.File[];
}

export class UploadSingleImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Single image file to upload',
  })
  image: Express.Multer.File;
}

export class DeleteImageDto {
  @ApiProperty({ description: 'Image filename or URL to delete' })
  @IsString()
  filename: string;
}

export class ReorderImagesDto {
  @ApiProperty({
    description: 'Array of image filenames in desired order',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  imageOrder: string[];
}
