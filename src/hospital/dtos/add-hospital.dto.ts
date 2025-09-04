import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, IsUrl, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AddHospitalDTO {
    @ApiProperty({
        description: 'Hospital name',
        example: 'City General Hospital'
    })
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.trim())
    name: string

    @ApiProperty({
        description: 'Hospital email address',
        example: 'info@cityhospital.com'
    })
    @IsNotEmpty()
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string

    @ApiPropertyOptional({
        description: 'Hospital phone number',
        example: '+1-555-123-4567'
    })
    @IsOptional()
    @IsString()
    phoneNumber?: string

    @ApiPropertyOptional({
        description: 'Hospital address',
        example: '123 Medical Center Drive'
    })
    @IsOptional()
    @IsString()
    address?: string

    @ApiPropertyOptional({
        description: 'City',
        example: 'New York'
    })
    @IsOptional()
    @IsString()
    city?: string

    @ApiPropertyOptional({
        description: 'State/Province',
        example: 'NY'
    })
    @IsOptional()
    @IsString()
    state?: string

    @ApiPropertyOptional({
        description: 'Country',
        example: 'USA'
    })
    @IsOptional()
    @IsString()
    country?: string

    @ApiPropertyOptional({
        description: 'Postal code',
        example: '10001'
    })
    @IsOptional()
    @IsString()
    postalCode?: string

    @ApiPropertyOptional({
        description: 'Hospital website',
        example: 'https://cityhospital.com'
    })
    @IsOptional()
    @IsUrl()
    website?: string

    @ApiPropertyOptional({
        description: 'Hospital description',
        example: 'A leading healthcare facility providing comprehensive medical services'
    })
    @IsOptional()
    @IsString()
    description?: string

    @ApiPropertyOptional({
        description: 'Hospital capacity (number of beds)',
        example: 500
    })
    @IsOptional()
    @IsNumber()
    capacity?: number

    @ApiPropertyOptional({
        description: 'Medical specialties offered',
        example: ['Cardiology', 'Neurology', 'Orthopedics']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    specialties?: string[]

    @ApiPropertyOptional({
        description: 'Emergency contact number',
        example: '+1-555-911-0000'
    })
    @IsOptional()
    @IsString()
    emergencyContact?: string

    @ApiPropertyOptional({
        description: 'Whether the hospital is active',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}

