import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayMinSize, IsOptional } from "class-validator";

export class AttributesToBeEmptyDTO {
    @ApiPropertyOptional({
        description: 'Attributes that should be empty',
        nullable: false,
        example: 'attributesName1,attributesName2....'
    })
    @IsOptional()
    @Transform(({ value }) => value.split(','))
    @ArrayMinSize(1)
    attributesToBeEmpty: string[]
}