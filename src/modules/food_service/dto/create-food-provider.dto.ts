import { IsString, IsMongoId, IsOptional, IsObject, ValidateNested, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateFoodProviderDto {
  @ApiProperty({ example: 'Tasty Bites' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Delicious home-cooked meals' })
  @IsString()
  description: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  location: string;

  @ApiPropertyOptional({ example: 'Italian' })
  @IsOptional()
  @IsString()
  cuisine_type?: string;

  @ApiPropertyOptional({ type: OperatingHoursDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operating_hours?: OperatingHoursDto;

  @ApiPropertyOptional({ type: ContactInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact_info?: ContactInfoDto;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}