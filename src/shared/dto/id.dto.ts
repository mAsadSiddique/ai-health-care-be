import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsPositive, IsInt, IsNotEmpty, IsMongoId } from 'class-validator'

export class IdDTO {
	@ApiProperty({
		description: 'id',
		type: String,
		example: '507f1f77bcf86cd799439011',
		required: true
	})
	@IsNotEmpty()
	@IsMongoId({
		message: 'id must be a valid 24-character hex MongoDB ObjectId',
	})
	id: string
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