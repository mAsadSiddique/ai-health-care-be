import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class ResendEmailDTO {
	@ApiProperty({
		description: "Admin's email",
		nullable: false,
		example: 'waqar@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	@Transform((email) => email.value.toLowerCase())
	email: string
}
