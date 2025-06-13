import { IsString, IsMongoId, IsOptional, ValidateNested, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class OperatingHoursDto {
  @ApiProperty({ example: '09:00' })
  @IsString()
  open: string;

  @ApiProperty({ example: '22:00' })
  @IsString()
  close: string;
}

class ContactInfoDto {
  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'info@restaurant.com' })
  @IsEmail()
  email: string;
}

export class UpdateFoodProviderDto {
  @ApiProperty({ example: 'Tasty Bites', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Delicious home-cooked meals', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false })
  @IsMongoId()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'Italian', required: false })
  @IsOptional()
  @IsString()
  cuisine_type?: string;

  @ApiProperty({ type: OperatingHoursDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operating_hours?: OperatingHoursDto;

  @ApiProperty({ type: ContactInfoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact_info?: ContactInfoDto;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}