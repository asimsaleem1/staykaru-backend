import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';

export class LandlordRegistrationDto {
  @ApiProperty({
    description: 'Phone number',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Country code for phone number',
    example: '+1',
    default: '+1',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: false,
  })
  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiProperty({
    description: 'Complete address',
    example: '123 Main Street, City, State, Country',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Identification type',
    example: 'cnic',
    enum: ['cnic', 'passport'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['cnic', 'passport'])
  identificationType: string;

  @ApiProperty({
    description: 'Identification number',
    example: '12345-1234567-1',
  })
  @IsString()
  @IsNotEmpty()
  identificationNumber: string;

  @ApiProperty({
    description: 'Business license number',
    example: 'BL-123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessLicense?: string;

  @ApiProperty({
    description: 'Years of experience in property management',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @ApiProperty({
    description: 'Property types managed',
    example: ['apartment', 'house', 'studio'],
    enum: ['apartment', 'house', 'studio', 'hostel', 'pg', 'room'],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['apartment', 'house', 'studio', 'hostel', 'pg', 'room'], {
    each: true,
  })
  propertyTypes?: string[];

  @ApiProperty({
    description: 'Emergency contact name',
    example: 'Jane Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({
    description: 'Emergency contact phone',
    example: '+1-555-0123',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiProperty({
    description: 'Relationship to emergency contact',
    example: 'Spouse',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContactRelationship?: string;
}
