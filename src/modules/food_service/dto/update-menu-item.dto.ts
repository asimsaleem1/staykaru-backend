import { IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuItemDto {
  @ApiProperty({ example: 'Butter Chicken', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 250, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 'Creamy, rich butter chicken curry',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
