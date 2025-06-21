import { IsString, IsEnum, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, SocialProvider } from '../schema/user.schema';

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

  @ApiProperty({ example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  address?: string;

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
