import { IsString, Length, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2FADto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address used for 2FA',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code received via email',
  })
  @IsString()
  @Length(6, 6)
  otp: string;
}
