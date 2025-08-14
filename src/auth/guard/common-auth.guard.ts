import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ExceptionService } from '../../shared/exception.service'
import { SharedService } from '../../shared/shared.service'
import { Reflector } from '@nestjs/core'
import { GUARDS_KEY } from '../decorators/guards.decorator'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { Admin, AdminDocument } from '../../admin/entities/admin.entity'
import { Doctor, DoctorDocument } from '../../doctor/entities/doctor.entity'

@Injectable()
export class CommonAuthGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly exceptionService: ExceptionService,
		private readonly sharedService: SharedService,
		@InjectModel(Admin.name)
		private readonly adminModel: Model<AdminDocument>,
		@InjectModel(Doctor.name)
		private readonly doctorModel?: Model<DoctorDocument>
	) {}

	async canActivate(context: ExecutionContext) {
		const req: any = context.switchToHttp().getRequest()
		// Checking if token exists
		if (!req.headers.authorization) {
			this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.JWT_REQUIRED)
		}
		// Geting Entity Name
		const requiredGuard = this.reflector.get<string>(GUARDS_KEY, context.getHandler())

		try {
			const decodedToken = this.sharedService.getDecodedToken(
				req.headers.authorization,
				context.switchToHttp().getRequest().url
			)
			if (decodedToken['payload']['type'] !== requiredGuard) {
				this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.JWT_INVALID)
			}

			if (
				(decodedToken['payload']['isForSignup'] &&
					context.switchToHttp().getRequest().url !== process.env.SET_ADMIN_PASSWORD_ROUTE_URL &&
					context.switchToHttp().getRequest().url !== process.env.RESEND_ADMIN_VERIFICATION_EMAIL_ROUTE_URL) ||
				(decodedToken['payload']['resetPassword'] &&
					context.switchToHttp().getRequest().url !== process.env.FORGOT_ADMIN_PASSWORD_ROUTE_URL)
			) {
				this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.UNAUTHORIZED)
			}

			// Get user from MongoDB based on guard type
			let user: any = null
			if (requiredGuard === 'ADMIN') {
				user = await this.adminModel.findOne({ email: decodedToken['payload']['email'] }).exec()
			} else if (requiredGuard === 'DOCTOR') {
				if (!this.doctorModel) {
					this.exceptionService.sendInternalServerErrorException('Doctor model not available')
				}
				user = await this.doctorModel.findOne({ email: decodedToken['payload']['email'] }).exec()
			}
			
			if (!user) {
				this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.UNAUTHORIZED)
			}
			if (!user.isEmailVerified) {
				this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.USER_EMAIL_UNVERIFIED)
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
