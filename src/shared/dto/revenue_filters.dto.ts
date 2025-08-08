import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsDateString, IsOptional } from "class-validator"

export class RevenueDto {
    @ApiPropertyOptional({
        description: 'from date',
        type: Date,
        example: '2024-06-09',
        required: true,
    })
    @IsOptional()
    @IsDateString()
    fromDate: Date

    @ApiPropertyOptional({
        description: 'to date',
        type: Date,
        example: '2024-07-09',
        required: true,
    })
    @IsOptional()
    @IsDateString()
    toDate: Date
}