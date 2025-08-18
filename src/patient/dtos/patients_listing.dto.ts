import { Transform } from 'class-transformer'
import { IsOptional, IsString, IsBoolean } from 'class-validator'
import { ApiPropertyOptional, IntersectionType, PartialType } from '@nestjs/swagger'
import { PaginationDTO } from '../../shared/dto/pagination.dto'

export class PatientsListingDTO extends PaginationDTO {
    @ApiPropertyOptional({
        description: 'Search by patient name, email or phone',
        example: 'jane',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    search?: string

    @ApiPropertyOptional({
        description: 'Filter by blocked status',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    isBlocked?: boolean

    @ApiPropertyOptional({
        description: 'Filter by email verification status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean
}


