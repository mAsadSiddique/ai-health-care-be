import { IsMongoId, IsOptional, IsString } from 'class-validator'
import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger'
import { PaginationDTO } from '../../shared/dto/pagination.dto'
import { IdDTO } from 'src/shared/dto/id.dto'

export class AnalyzeDataListingDTO extends IntersectionType(PartialType(IdDTO), PaginationDTO) {

    @ApiProperty({ description: 'Filter by doctor ID', required: false })
    @IsOptional()
    @IsMongoId()
    doctorId?: string
}
