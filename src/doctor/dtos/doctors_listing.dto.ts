import { Transform } from 'class-transformer'
import { IsOptional, IsString, IsBoolean, IsNumber, Min, IsEnum } from 'class-validator'
import { ApiPropertyOptional, IntersectionType, PartialType } from '@nestjs/swagger'
import { PaginationDTO } from '../../shared/dto/pagination.dto'
import { IdDTO } from 'src/shared/dto/id.dto'
import { UserType } from 'src/utils/enums/user-type.enum'

export class DoctorsListingDTO extends IntersectionType(PaginationDTO, PartialType(IdDTO)) {
    @ApiPropertyOptional({
        description: 'Search by doctor name or email',
        example: 'john',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
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

    @ApiPropertyOptional({
        description: 'Filter by specialization',
        example: 'Cardiology',
    })
    @IsOptional()
    @IsString()
    specialization?: string

    @ApiPropertyOptional({
        description: 'Filter by minimum experience years',
        example: 5,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minExperience?: number

    @ApiPropertyOptional({
        description: 'Filter by maximum experience years',
        example: 15,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxExperience?: number

    @ApiPropertyOptional({
        description: 'Filter by qualification',
        example: 'MD',
    })
    @IsOptional()
    @IsString()
    qualification?: string
}

