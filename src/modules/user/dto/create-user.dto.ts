import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsUrl,
  Matches,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, IdentificationType } from '../schema/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '+92' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{1,4}$/, {
    message: 'Country code must start with + and contain 1-4 digits',
  })
  countryCode: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({
    enum: IdentificationType,
    example: IdentificationType.CNIC,
    required: false,
  })
  @IsEnum(IdentificationType)
  @IsOptional()
  identificationType?: IdentificationType;

  @ApiProperty({ example: '12345-6789012-3', required: false })
  @IsString()
  @IsOptional()
  identificationNumber?: string;

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
  @IsString()
  @IsOptional()
  socialProvider?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
