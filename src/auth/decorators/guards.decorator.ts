import { SetMetadata } from '@nestjs/common'

export const GUARDS_KEY = 'guards'
export const GuardName = (guardName: string) => SetMetadata(GUARDS_KEY, guardName)
