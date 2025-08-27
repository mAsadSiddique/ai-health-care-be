import { SetMetadata } from '@nestjs/common'
import { UserType } from '../../utils/enums/user-type.enum'

export const USER_TYPE_KEY = 'userType'
export const UserTypeGuard = (...userTypes: UserType[]) => SetMetadata(USER_TYPE_KEY, userTypes)
