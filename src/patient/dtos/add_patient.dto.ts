import { Transform, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, ValidateNested, IsInt, Min, Max } from 'class-validator'
import { GenderEnum } from 'src/utils/enums/gender.enum'

class UserDobDTO {
    @ApiProperty({ description: 'Day of birth', type: Number, minimum: 1, maximum: 31, example: 25 })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(31)
    day!: number

    @ApiProperty({ description: 'Month of birth', type: Number, minimum: 1, maximum: 12, example: 11 })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(12)
    month!: number

    @ApiProperty({ description: 'Year of birth', type: Number, minimum: 1900, maximum: 2100, example: 1995 })
    @IsNotEmpty()
    @IsInt()
    @Min(1950)
    @Max(new Date().getFullYear())
    year!: number
}

export class AddPatientDTO {
    @ApiProperty({ description: "Patient's email address", example: 'jane.patient@example.com' })
    @IsNotEmpty()
    @IsEmail()
    @Transform((email) => email.value.toLowerCase())
    email: string

    @ApiPropertyOptional({ description: "Patient's first name", example: 'Jane' })
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @Length(1, 30)
    firstName?: string

    @ApiPropertyOptional({ description: "Patient's last name", example: 'Doe' })
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @Length(1, 30)
    lastName?: string

    @ApiPropertyOptional({ description: "Patient's phone number", example: '+15555555555' })
    @IsOptional()
    @IsString()
    phoneNumber?: string

    @ApiPropertyOptional({ description: "Patient's address", example: '123 Main St, City' })
    @IsOptional()
    @IsString()
    address?: string

    @ApiPropertyOptional({ description: 'Patient gender', enum: GenderEnum })
    @IsOptional()
    @IsEnum(GenderEnum)
    gender?: GenderEnum

    @ApiPropertyOptional({ description: 'Patient date of birth', type: UserDobDTO })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => UserDobDTO)
    dateOfBirth?: UserDobDTO

    @ApiPropertyOptional({ description: 'Emergency contact name/number', example: '+15551234567' })
    @IsOptional()
    @IsString()
    emergencyContact?: string
}