import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsPositive, ArrayMinSize, IsInt } from 'class-validator'

export class IdsDTO {
	@ApiProperty({
		description: 'ids',
		type: Number,
		example: [1, 34, 21, 4],
		required: true
	})
	@ArrayMinSize(1)
	@IsPositive({ each: true })
	@IsInt({ each: true })
	ids: number[]
}

export class ParamsIdsDTO {
	@ApiProperty({
		description: 'List of parameter ids',
		type: Number,
		example: "1, 34, 21, 4",
		required: true
	})
	@Transform(({ value }) => value.split(',').map(Number))
	@ArrayMinSize(1)
	@IsPositive({ each: true })
	@IsInt({ each: true })
	ids: number[]
}