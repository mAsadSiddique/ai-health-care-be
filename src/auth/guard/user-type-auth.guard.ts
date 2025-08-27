import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ExceptionService } from '../../shared/exception.service'
import { USER_TYPE_KEY } from '../decorators/user-type.decorator'
import { UserType } from '../../utils/enums/user-type.enum'
import { SharedService } from '../../shared/shared.service'
import { User } from '../../user/entities/user.entity'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'

@Injectable()
export class UserTypeAuthGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly exceptionService: ExceptionService,
		private readonly sharedService: SharedService
	) {}

	async canActivate(context: ExecutionContext) {
		try {
			const requiredUserTypes = this.reflector.getAllAndOverride<UserType[]>(USER_TYPE_KEY, [
				context.getHandler(),
				context.getClass(),
			])

			if (!requiredUserTypes) {
				return true // No user type restriction
			}

			const req: any = context.switchToHttp().getRequest()
			const user: User = req.user

			if (!user) {
				this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.UNAUTHORIZED)
			}
            req.user = user
			return requiredUserTypes.includes(user.userType)
		} catch (error) {
			console.error('error in user type guard: ', error.message)
			this.sharedService.exceptionDetector(error)
			this.sharedService.sendError(error, 'UserTypeAuthGuard')
		}
	}
}
