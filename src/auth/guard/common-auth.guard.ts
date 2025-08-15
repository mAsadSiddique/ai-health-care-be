import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ExceptionService } from '../../shared/exception.service'
import { SharedService } from '../../shared/shared.service'
import { Reflector } from '@nestjs/core'
import { GUARDS_KEY } from '../decorators/guards.decorator'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { User, UserDocument } from '../../user/entities/user.entity'
import { UserType } from '../../utils/enums/user-type.enum'

@Injectable()
export class CommonAuthGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly exceptionService: ExceptionService,
		private readonly sharedService: SharedService,
		@InjectModel(User.name)
		private readonly userModel: Model<UserDocument>
	) {}

	async canActivate(context: ExecutionContext) {
		const req: any = context.switchToHttp().getRequest()
		// Checking if token exists
		if (!req.headers.authorization) {
			this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.JWT_REQUIRED)
		}

		try {
			const decodedToken = this.sharedService.getDecodedToken(
				req.headers.authorization,
				context.switchToHttp().getRequest().url
			)

			// Check if userType is present in token
			if (!decodedToken['payload']['userType']) {
				this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.JWT_INVALID)
			}

			// Get user from MongoDB based on userType and email
			const user = await this.userModel.findOne({
				email: decodedToken['payload']['email'],
				userType: decodedToken['payload']['userType']
			}).exec()
			
			if (!user) {
				this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.UNAUTHORIZED)
			}

			if (!user.isEmailVerified) {
				this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.EMAIL_NOT_VERIFIED)
			}

			if (user.isBlocked) {
				this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.USER_BLOCKED)
			}

			req.user = user
			return true
		} catch (error) {
			console.error('error in auth guard: ', error.message)
			this.sharedService.exceptionDetector(error)
			this.sharedService.sendError(error, 'CommonAuthGuard')
		}
	}
}
