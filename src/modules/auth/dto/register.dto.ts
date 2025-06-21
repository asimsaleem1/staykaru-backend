import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  MinLength,
  IsOptional,
  IsUrl,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, IdentificationType } from '../../user/schema/user.schema';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'student', description: 'User role', enum: UserRole })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: '1234567890',
    description: 'Phone number without country code',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    example: '+92',
    description: 'Country code for phone number',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d{1,4}$/, {
    message: 'Country code must start with + and contain 1-4 digits',
  })
  countryCode: string;

  @ApiProperty({ example: 'male', description: 'User gender' })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'Profile image URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @ApiProperty({
    example: 'cnic',
    description: 'Type of identification',
    enum: IdentificationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(IdentificationType)
  identificationType?: IdentificationType;

  @ApiProperty({
    example: '12345-6789012-3',
    description: 'CNIC or Passport number',
    required: false,
  })
  @IsOptional()
  @IsString()
  identificationNumber?: string;
}
