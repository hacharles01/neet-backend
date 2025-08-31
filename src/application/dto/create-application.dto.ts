import { IsString, IsOptional, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus, Gender, RegistrationType } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty({
    example: 'I am interested in this opportunity',
    description: 'Optional message from the applicant',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    example: ApplicationStatus.PENDING,
    enum: ApplicationStatus,
    description: 'The current status of the application',
    required: false,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @ApiProperty({
    example: RegistrationType.KWIGA_IMYUGA,
    enum: RegistrationType,
    description: 'Type of registration',
    required: true,
  })
  @IsEnum(RegistrationType)
  @IsNotEmpty()
  registrationType: RegistrationType;

  // Personal Information
  @ApiProperty({
    example: 'John',
    description: 'First name of the applicant',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the applicant',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '1234567890123456',
    description: 'Unique national ID of the applicant',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @ApiProperty({
    example: Gender.GABO,
    enum: Gender,
    description: 'Gender of the applicant',
    required: true,
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth of the applicant',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiProperty({
    example: '+250785161508',
    description: 'Telephone number of the applicant',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  telephone: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the applicant',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  // Location
  @ApiProperty({ example: 'Kigali', description: 'Province of residence' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ example: 'Nyarugenge', description: 'District of residence' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Kigali Sector', description: 'Sector of residence' })
  @IsString()
  @IsNotEmpty()
  sector: string;

  @ApiProperty({ example: 'Kigali Cell', description: 'Cell of residence' })
  @IsString()
  @IsNotEmpty()
  cell: string;

  @ApiProperty({ example: 'Kigali Village', description: 'Village of residence' })
  @IsString()
  @IsNotEmpty()
  village: string;

  // Education
  @ApiProperty({
    example: 'Bachelor’s Degree',
    description: 'Highest education level of the applicant',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  educationLevel: string;

  // Skills/Professions
  @ApiProperty({
    example: 'Software Development',
    description: 'Primary skill or profession',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  primarySkill: string;

  @ApiProperty({
    example: 'Data Analysis',
    description: 'Secondary skill or profession',
    required: false,
  })
  @IsString()
  @IsOptional()
  secondarySkill?: string;

  @ApiProperty({
    example: 'Project Management',
    description: 'Tertiary skill or profession',
    required: false,
  })
  @IsString()
  @IsOptional()
  tertiarySkill?: string;

  @ApiProperty({
    example: 'Graphic Design, Public Speaking',
    description: 'Other additional skills',
    required: false,
  })
  @IsString()
  @IsOptional()
  otherSkills?: string;
}
