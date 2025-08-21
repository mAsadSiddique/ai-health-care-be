import { Transform } from 'class-transformer'
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, Length, Max, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Roles } from '../../utils/enums/roles.enum'

export class AddAdminDTO {
	@ApiPropertyOptional({
		description: "user's first name",
		nullable: true,
		example: 'waqar',
	})
	@IsOptional()
	@Transform(({ value }) => value.trim())
	@Length(1, 30)
	firstName: string

	@ApiPropertyOptional({
		description: "user's last name",
		nullable: true,
		example: 'hussain',
	})
	@IsOptional()
	@Transform(({ value }) => value.trim())
	@Length(1, 30)
	lastName: string

	@ApiProperty({
		description: 'user’s email address',
		nullable: false,
		example: 'waqar@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	@Transform((email) => email.value.toLowerCase())
	email: string

	@ApiPropertyOptional({
		description: "Admin's role",
		nullable: true,
		example: Roles.SUPER,
	})
	@IsNotEmpty()
	@IsEnum(Roles)
	role: Roles

	@ApiPropertyOptional({
		description: 'Enter the user age',
		type: Number,
		nullable: true,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(120)
	age: number
}
