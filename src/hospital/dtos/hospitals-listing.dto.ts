import { Transform } from 'class-transformer'
import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator'
import { ApiPropertyOptional, IntersectionType, PartialType } from '@nestjs/swagger'
import { PaginationDTO } from '../../shared/dto/pagination.dto'
import { IdDTO } from 'src/shared/dto/id.dto'

export class HospitalsListingDTO extends IntersectionType(PaginationDTO, PartialType(IdDTO)) {
    @ApiPropertyOptional({
        description: 'Search by hospital name',
        example: 'General'
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
    name?: string

    @ApiPropertyOptional({
        description: 'Search by hospital email',
        example: 'info@hospital.com'
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.toLowerCase().trim())
    email?: string

    @ApiPropertyOptional({
        description: 'Search by city',
        example: 'New York'
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
    city?: string

    @ApiPropertyOptional({
        description: 'Search by state',
        example: 'NY'
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
    state?: string

    @ApiPropertyOptional({
        description: 'Search by country',
        example: 'USA'
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
    country?: string

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean

    @ApiPropertyOptional({
        description: 'Search by specialty',
        example: 'Cardiology'
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
    specialty?: string

    @ApiPropertyOptional({
        description: 'Minimum capacity',
        example: 100
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minCapacity?: number

    @ApiPropertyOptional({
        description: 'Maximum capacity',
        example: 1000
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10000)
    maxCapacity?: number
}

