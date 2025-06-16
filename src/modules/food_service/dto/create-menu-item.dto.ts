import { IsString, IsNumber, Min, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Butter Chicken' })
  @IsString()
  name: string;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Creamy, rich butter chicken curry' })
  @IsString()
  description: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  provider: string;
}
