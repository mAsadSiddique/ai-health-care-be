import { Transform } from 'class-transformer'
import { IsNotEmpty, IsEmail } from 'class-validator'

export class ForgotPasswordDTO {
	@IsNotEmpty()
	@IsEmail()
	@Transform((email) => email.value.toLowerCase())
	email: string
}
