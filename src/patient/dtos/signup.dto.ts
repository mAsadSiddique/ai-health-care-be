import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Matches } from 'class-validator'
import { AddPatientDTO } from './add_patient.dto'

export class SignupDTO extends AddPatientDTO {

	@ApiProperty({
		description: 'Password is required',
		nullable: false,
		example: 'Asad@786',
	})
	@IsNotEmpty()
	@Matches(/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,30})$/, {
		message: 'password must contain atleast 8 letters, 1 upper case, lower case, number and special character',
	})
	password!: string

	@ApiProperty({
		description: 'Confirm password is required',
		nullable: false,
		example: 'Asad@786',
	})
	@IsNotEmpty()
	@Matches(/^((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,30})$/, {
		message: 'confirmPassword must contain atleast 8 letters, 1 upper case, lower case, number and special character',
	})
	confirmPassword!: string
}
