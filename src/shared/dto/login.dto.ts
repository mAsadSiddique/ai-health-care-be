import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsEmail, Length } from 'class-validator'

export class LoginDTO {
	@ApiProperty({
		description: 'user’s email address',
		nullable: false,
		example: 'waqar@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	@Transform((email) => email.value.toLowerCase())
	email: string

	@ApiProperty({
		description: 'user’s password',
		nullable: false,
		example: 'Waqar@123',
	})
	@IsNotEmpty()
	@Length(1, 50)
	password: string
}
