import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsOptional, IsPositive, Length } from 'class-validator'
import { toBoolean } from '../../utils/utils'
import { Roles } from '../../utils/enums/roles.enum'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDTO } from '../../shared/dto/pagination.dto'

export class AdminListingDTO extends PaginationDTO {
	@ApiPropertyOptional({
		description: 'Search admin by id',
		nullable: true,
		example: 3,
	})
	@IsOptional()
	@IsPositive()
	id: number

	@ApiPropertyOptional({
		description: 'Search admins by role',
		nullable: true,
		example: Roles.SUPER,
	})
	@IsOptional()
	@IsEnum(Roles)
	role: Roles

	@ApiPropertyOptional({
		description: 'Searching through block/unblock admins',
		nullable: true,
		example: false,
	})
	@IsOptional()
	@Transform(({ value }) => toBoolean(value))
	@IsBoolean()
	isBlocked: boolean

	@ApiPropertyOptional({
		description: "Search which admin's email is verified or not",
		nullable: true,
		example: true,
	})
	@IsOptional()
	@Transform(({ value }) => toBoolean(value))
	@IsBoolean()
	isEmailVerified: boolean

	@ApiPropertyOptional({
		description: 'Searching through email, first name last name etc...',
		nullable: true,
		example: 'waqar',
	})
	@IsOptional()
	@Transform(({ value }) => value.trim())
	@Length(1, 100)
	search: string
}
