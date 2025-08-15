import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ExceptionService } from '../../shared/exception.service'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { Roles } from '../../utils/enums/roles.enum'
import { SharedService } from '../../shared/shared.service'
import { User } from '../../user/entities/user.entity'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly exceptionService: ExceptionService,
		private readonly sharedService: SharedService
	) {}
	async canActivate(context: ExecutionContext) {
		try {
			const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
				context.getHandler(),
				context.getClass(),
			])

			if (!requiredRoles) {
				this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.ROLE_REQUIRED)
			}

			const req: any = context.switchToHttp().getRequest()
			const user: User = req.user
			return requiredRoles.some((role) => user.role?.includes(role))
		} catch (error) {
			console.error('error in role guard: ', error.message)
			this.sharedService.exceptionDetector(error)
			this.sharedService.sendError(error, 'RoleGuard')
		}
	}
}
