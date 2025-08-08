import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsNumberString, IsString, Length, Matches } from 'class-validator'

export class SetPasswordDTO {
	@ApiProperty({
		description: "Admin's email",
		nullable: false,
		example: 'waqar@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	@Transform((email) => email.value.toLowerCase())
	email: string

	@ApiProperty({
		description: 'Provide code for email/phone number verification',
		nullable: false,
		example: "326543",
	})
	@IsNotEmpty()
	@IsNumberString()
	@Length(6, 6)
	code!: string

	@ApiProperty({
		description: "Admin's password",
		nullable: false,
		example: 'Waqar.123!',
	})
	@IsNotEmpty()
	@IsString()
	@Matches(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,30})$/, {
		message: 'password must contain atleast 8 letters, 1 upper case, lower case, number and special character',
	})
	password: string

	@ApiProperty({
		description: "Admin's confirm password ",
		nullable: false,
		example: 'Waqar.123!',
	})
	@IsNotEmpty()
	@IsString()
	@Matches(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,30})$/, {
		message: 'confirmPassword must contain atleast 8 letters, 1 upper case, lower case, number and special character',
	})
	confirmPassword: string
}
