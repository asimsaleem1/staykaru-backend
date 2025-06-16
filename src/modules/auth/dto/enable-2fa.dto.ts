import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Enable2FADto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;
}
