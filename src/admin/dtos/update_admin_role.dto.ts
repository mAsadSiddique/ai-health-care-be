import { IsNotEmpty, IsMongoId } from 'class-validator'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { AddAdminDTO } from './add_admin.dto'

export class UpdateAdminRoleDTO extends PickType(AddAdminDTO, ['role']) {

	@ApiProperty({
		description: 'Admin id is required to update admin role',
		nullable: false,
		example: '507f1f77bcf86cd799439011'
	})
	@IsNotEmpty()
	@IsMongoId()
	id: string
}
