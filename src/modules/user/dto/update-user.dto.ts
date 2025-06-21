import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  UserRole,
  SocialProvider,
  IdentificationType,
} from '../schema/user.schema';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '+1', required: false })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'male', required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({ enum: IdentificationType, required: false })
  @IsEnum(IdentificationType)
  @IsOptional()
  identificationType?: IdentificationType;

  @ApiProperty({ example: '12345-1234567-1', required: false })
  @IsString()
  @IsOptional()
  identificationNumber?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  registrationComplete?: boolean;

  @ApiProperty({ example: 'University of California', required: false })
  @IsString()
  @IsOptional()
  university?: string;

  @ApiProperty({ example: 'STU123456', required: false })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({ example: 'Computer Science', required: false })
  @IsString()
  @IsOptional()
  program?: string;

  @ApiProperty({ example: '2', required: false })
  @IsString()
  @IsOptional()
  yearOfStudy?: string;

  @ApiProperty({ example: '2000-01-15', required: false })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ example: 'John Doe Sr.', required: false })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiProperty({ example: '+1-555-0123', required: false })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiProperty({ example: 'Father', required: false })
  @IsString()
  @IsOptional()
  emergencyContactRelationship?: string;

  // Landlord-specific fields
  @ApiProperty({ example: 'BL-123456789', required: false })
  @IsString()
  @IsOptional()
  businessLicense?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  yearsOfExperience?: number;

  @ApiProperty({ example: ['apartment', 'house'], required: false })
  @IsOptional()
  propertyTypes?: string[];

  // Food Provider-specific fields
  @ApiProperty({ example: 'Delicious Food Corner', required: false })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiProperty({ example: 'FL-123456789', required: false })
  @IsString()
  @IsOptional()
  foodLicense?: string;

  @ApiProperty({ example: 'BR-987654321', required: false })
  @IsString()
  @IsOptional()
  businessRegistration?: string;

  @ApiProperty({ example: ['pakistani', 'indian'], required: false })
  @IsOptional()
  cuisineTypes?: string[];

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  averageDeliveryTime?: number;

  @ApiProperty({ example: 200, required: false })
  @IsOptional()
  minimumOrder?: number;

  @ApiProperty({ example: '9:00 AM - 11:00 PM', required: false })
  @IsString()
  @IsOptional()
  operatingHours?: string;

  @ApiProperty({ example: 'hashedPassword', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  // Social login fields
  @ApiProperty({ example: 'facebook_user_id_123', required: false })
  @IsString()
  @IsOptional()
  facebookId?: string;

  @ApiProperty({ example: 'google_user_id_456', required: false })
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiProperty({
    enum: ['email', 'facebook', 'google'],
    example: 'email',
    required: false,
  })
  @IsEnum(SocialProvider)
  @IsOptional()
  socialProvider?: SocialProvider;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
