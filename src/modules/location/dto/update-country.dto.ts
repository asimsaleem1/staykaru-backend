import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCountryDto {
  @ApiPropertyOptional({ 
    example: 'India',
    description: 'Updated name of the country',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Country name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Country name must not exceed 100 characters' })
  name?: string;
}
