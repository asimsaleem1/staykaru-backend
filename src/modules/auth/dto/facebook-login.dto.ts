import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FacebookLoginDto {
  @ApiProperty({
    description: 'Facebook access token received from Facebook SDK',
    example: 'EAABwzLixnjYBO4ZCZCZCpQyQyQyQyQyQyQy...',
  })
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
