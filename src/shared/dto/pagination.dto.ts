import { Type } from 'class-transformer'
import { IsOptional, IsPositive, Min } from 'class-validator'

export class PaginationDTO {
	@IsOptional()
	@Type(() => Number)
	@Min(0)
	pageNumber = 0

	@IsOptional()
	@Type(() => Number)
	@IsPositive()
	pageSize = 10
}
