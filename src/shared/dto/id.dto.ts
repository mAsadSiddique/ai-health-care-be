import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsPositive, IsInt, IsNotEmpty } from 'class-validator'

export class IdDTO {
	@ApiProperty({
		description: 'id',
		type: Number,
		example: 567,
		required: true
	})
	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	id: number
}

export class ParamIdDTO {
	@ApiProperty({
		description: 'id',
		type: Number,
		example: 567,
		required: true
	})
	@IsNotEmpty()
	@Type(() => Number)
	@IsPositive()
	@IsInt()
	id: number
}