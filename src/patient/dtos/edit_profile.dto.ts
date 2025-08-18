import { Transform, Type } from 'class-transformer'
import { IsOptional, Length, IsString, ValidateNested, IsInt, Min, Max, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { GenderEnum } from 'src/utils/enums/gender.enum'

class UserDobDTO {
    @ApiPropertyOptional({ description: 'Day of birth', type: Number, minimum: 1, maximum: 31, example: 25 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(31)
    day?: number

    @ApiPropertyOptional({ description: 'Month of birth', type: Number, minimum: 1, maximum: 12, example: 11 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    month?: number

    @ApiPropertyOptional({ description: 'Year of birth', type: Number, minimum: 1900, maximum: 2100, example: 1995 })
    @IsOptional()
    @IsInt()
    @Min(1950)
    @Max(new Date().getFullYear())
    year?: number
}

export class EditPatientDTO {
    @ApiPropertyOptional({ description: 'First name', example: 'Jane' })
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @Length(1, 30)
    firstName?: string

    @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @Length(1, 30)
    lastName?: string

    @ApiPropertyOptional({ description: 'Phone number', example: '+15555555555' })
    @IsOptional()
    @IsString()
    phoneNumber?: string

    @ApiPropertyOptional({ description: 'Address', example: '123 Main St, City' })
    @IsOptional()
    @IsString()
    address?: string

    @ApiPropertyOptional({ description: 'Date of birth', type: UserDobDTO })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => UserDobDTO)
    dateOfBirth?: UserDobDTO

    @ApiPropertyOptional({ description: 'Gender', enum: GenderEnum })
    @IsOptional()
    @IsEnum(GenderEnum)
    gender?: GenderEnum

    @ApiPropertyOptional({ description: 'Emergency contact', example: '+15551234567' })
    @IsOptional()
    @IsString()
    emergencyContact?: string
}


