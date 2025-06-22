import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to send verification code to',
  })
  @IsEmail()
  email: string;
}
