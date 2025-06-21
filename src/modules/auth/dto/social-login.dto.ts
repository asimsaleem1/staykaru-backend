import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({
    description: 'Social media provider',
    example: 'google',
    enum: ['google', 'facebook'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['google', 'facebook'])
  provider: string;

  @ApiProperty({
    description: 'Access token or ID token from the social provider',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkY...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
  // Role is automatically set to 'student' for this simplified flow
  // No need for role selection input
}
