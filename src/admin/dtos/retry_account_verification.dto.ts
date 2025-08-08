import { AddAdminDTO } from './add_admin.dto'
import { PickType } from '@nestjs/swagger'

export class RetryAccountVerificationDTO extends PickType(AddAdminDTO, ['email']) { }
