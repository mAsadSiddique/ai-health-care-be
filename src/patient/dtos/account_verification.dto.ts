import { IsNotEmpty, IsNumberString, Length } from 'class-validator'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { SignupDTO } from './signup.dto'

export class AccountVerificationDTO extends PickType(SignupDTO, ['email']) {
	@ApiProperty({
		description: 'Provide code for email/phone number verification',
		nullable: false,
		example: '326543',
	})
	@IsNotEmpty()
	@IsNumberString()
	@Length(6, 6)
	code!: string
}
