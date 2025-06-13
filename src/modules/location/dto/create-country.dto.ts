import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({ 
    example: 'India',
    description: 'Name of the country',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Country name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Country name must not exceed 100 characters' })
  name: string;
}