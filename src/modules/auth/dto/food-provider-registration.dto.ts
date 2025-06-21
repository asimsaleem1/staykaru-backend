import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class FoodProviderRegistrationDto {
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
    description: 'Business address',
    example: '123 Restaurant Street, Food District, City',
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
    description: 'Restaurant/Business name',
    example: 'Delicious Food Corner',
  })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    description: 'Food license number',
    example: 'FL-123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  foodLicense?: string;

  @ApiProperty({
    description: 'Business registration number',
    example: 'BR-987654321',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessRegistration?: string;

  @ApiProperty({
    description: 'Types of cuisine offered',
    example: ['pakistani', 'indian', 'chinese'],
    enum: [
      'pakistani',
      'indian',
      'chinese',
      'italian',
      'mexican',
      'american',
      'thai',
      'japanese',
      'mediterranean',
      'fast_food',
      'desserts',
      'beverages',
    ],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(
    [
      'pakistani',
      'indian',
      'chinese',
      'italian',
      'mexican',
      'american',
      'thai',
      'japanese',
      'mediterranean',
      'fast_food',
      'desserts',
      'beverages',
    ],
    {
      each: true,
    },
  )
  cuisineTypes?: string[];

  @ApiProperty({
    description: 'Years of experience in food business',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @ApiProperty({
    description: 'Average delivery time in minutes',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  averageDeliveryTime?: number;

  @ApiProperty({
    description: 'Minimum order amount',
    example: 200,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrder?: number;

  @ApiProperty({
    description: 'Operating hours (e.g., "9:00 AM - 11:00 PM")',
    example: '9:00 AM - 11:00 PM',
    required: false,
  })
  @IsOptional()
  @IsString()
  operatingHours?: string;

  @ApiProperty({
    description: 'Emergency contact name',
    example: 'John Doe Sr.',
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
    example: 'Business Partner',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContactRelationship?: string;
}
