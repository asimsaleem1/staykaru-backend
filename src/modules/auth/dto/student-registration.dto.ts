import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsDateString,
} from 'class-validator';

export class StudentRegistrationDto {
  @ApiProperty({
    description: 'University name',
    example: 'University of California, Berkeley',
  })
  @IsString()
  @IsNotEmpty()
  university: string;

  @ApiProperty({
    description: 'Student ID',
    example: 'STU123456',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Phone number',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Country code for phone number',
    example: '+1',
    default: '+1',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: false,
  })
  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '2000-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Study program or major',
    example: 'Computer Science',
    required: false,
  })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiProperty({
    description: 'Year of study',
    example: '2',
    enum: ['1', '2', '3', '4', '5', '6', 'graduate', 'phd'],
    required: false,
  })
  @IsOptional()
  @IsIn(['1', '2', '3', '4', '5', '6', 'graduate', 'phd'])
  yearOfStudy?: string;

  @ApiProperty({
    description: 'Emergency contact name',
    example: 'John Doe Sr.',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({
    description: 'Emergency contact phone',
    example: '+1-555-0123',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiProperty({
    description: 'Relationship to emergency contact',
    example: 'Father',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContactRelationship?: string;
}
