import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class ChangePasswordDTO {
	@IsNotEmpty()
	@IsString()
	@Matches(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,30})$/, {
		message: 'password must contain atleast 8 letters, 1 upper case, lower case, number and special character',
	})
	password: string

	@IsNotEmpty()
	@IsString()
	@Matches(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,30})$/, {
		message: 'confirmPassword must contain atleast 8 letters, 1 upper case, lower case, number and special character',
	})
	confirmPassword: string

	@IsNotEmpty()
	@IsString()
	oldPassword: string
}
