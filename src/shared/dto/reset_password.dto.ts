import { IsJWT, IsNotEmpty } from 'class-validator'
import { OmitType } from '@nestjs/mapped-types'
import { ChangePasswordDTO } from './change_password.dto'

export class ReSetPasswordDTO extends OmitType(ChangePasswordDTO, ['oldPassword']) {
	@IsNotEmpty()
	@IsJWT()
	jwtToken: string
}
