import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ExceptionService } from '../../shared/exception.service'
import { LoginDTO } from '../../shared/dto/login.dto'
import { SharedService } from '../../shared/shared.service'
import { AddAdminDTO } from '../dtos/add_admin.dto'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { Admin, AdminDocument } from '../entities/admin.entity'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { Mailer } from '../../utils/mailer/mailer'
import { SetPasswordDTO } from '../dtos/set_password.dto'
import { ResendEmailDTO } from '../dtos/resend_email.dto'
import { AdminListingDTO } from '../dtos/admins_listing.dto'
import { isPositive } from 'class-validator'
import { EditProfileDTO } from '../dtos/edit_profile.dto'
import { UpdateAdminRoleDTO } from '../dtos/update_admin_role.dto'
import { ForgotPasswordDTO } from 'src/shared/dto/forgot_password.dto'
import { ChangePasswordDTO } from 'src/shared/dto/change_password.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { RetryAccountVerificationDTO } from '../dtos/retry_account_verification.dto'
import * as randomString from 'randomstring'
import { ResetPasswordDTO } from '../dtos/reset_password.dto'


@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name)
    constructor(
        @Inject(CACHE_MANAGER) private accountVerificationCache: any,
        @InjectModel(Admin.name)
        private readonly adminModel: Model<AdminDocument>,
        private readonly exceptionService: ExceptionService,
        private readonly sharedService: SharedService
    ) { }

    async login(args: LoginDTO) {
        try {
            const adminInDB = await this.adminModel.findOne({ email: args.email }).exec()
            if (!adminInDB) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.ADMIN_NOT_FOUND)
            }
            if (adminInDB.isBlocked) {
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.USER_BLOCKED)
            }
            if (!adminInDB.isEmailVerified) {
                this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.USER_EMAIL_UNVERIFIED)
            }
            this.sharedService.bcryptCompareVerificatoin(args.password, adminInDB.password)
            const data: unknown = {}
            let payload: any = this.getPayload(adminInDB)
            const jwtToken = this.sharedService.getJwt(payload)
            data['jwtToken'] = jwtToken
            payload = this.getProfileData(adminInDB)
            data['admin'] = payload
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.LOGGED_IN, data)
        } catch (error) {
            this.sharedService.sendError(error, this.login.name)
        }
    }

    async addAdmin(args: AddAdminDTO) {
        try {
            const adminInDb = await this.adminModel.findOne({ email: args.email }).exec()
            if (adminInDb) {
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.ADMIN_ALREADY_EXIST)
            }
            const admin: Admin = new Admin(args)

            // Generate random password that meets regex requirements
            const randomPassword = this.generateSecurePassword()

            admin['password'] = this.sharedService.hashedPassword('Admin@123')
            admin['isEmailVerified'] = true // Set email as verified since we're sending credentials
            const newAdmin = new this.adminModel(admin)
            await newAdmin.save()

            // Send email with credentials
            const msg = await this.sendAdminCredentials(args.email, randomPassword)
            this.logger.log(`Admin credentials sent successfully for admin ${newAdmin._id}`, this.addAdmin.name)
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.addAdmin.name)
        }
    }

    private generateSecurePassword(): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const lowercase = 'abcdefghijklmnopqrstuvwxyz'
        const numbers = '0123456789'
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

        // Ensure at least one character from each required category
        let password = ''
        password += uppercase[Math.floor(Math.random() * uppercase.length)] // At least 1 uppercase
        password += lowercase[Math.floor(Math.random() * lowercase.length)] // At least 1 lowercase
        password += numbers[Math.floor(Math.random() * numbers.length)] // At least 1 number
        password += specialChars[Math.floor(Math.random() * specialChars.length)] // At least 1 special char

        // Fill the rest with random characters from all categories
        const allChars = uppercase + lowercase + numbers + specialChars
        for (let i = 4; i < 12; i++) { // Total length 12 characters
            password += allChars[Math.floor(Math.random() * allChars.length)]
        }

        // Shuffle the password to make it more random
        return password.split('').sort(() => Math.random() - 0.5).join('')
    }

    private async sendAdminCredentials(email: string, password: string): Promise<string> {
        try {
            // TODO: Implement actual email sending logic
            // For now, we'll log the credentials and return success message
            this.logger.log(`Doctor credentials for ${email}: Password - ${password}`, this.sendAdminCredentials.name)

            // Example email sending (uncomment when email service is configured)
            // const isEmailSent = await Mailer.sendAdminCredentials(email, password)
            // if (!isEmailSent) {
            //     this.exceptionService.sendInternalServerErrorException('Failed to send doctor credentials email')
            // }

            return RESPONSE_MESSAGES.ADMIN_REGISTERED
        } catch (error) {
            this.sharedService.sendError(error, this.sendAdminCredentials.name)
        }
    }

    async sendSetPasswordCode(args: RetryAccountVerificationDTO, user: Admin) {
        try {
            let msg: string
            // generate verification code
            const code = randomString.generate({ length: 6, charset: 'numeric' })
            this.logger.debug(`Set Password code generated for admin : ${args.email}`)
            if (args.email) {
                if (user.isEmailVerified) {
                    this.logger.warn(`Admin email already verified: ${user._id}`)
                    this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.ADMIN_EMAIL_ALREADY_VERIFIED)
                }
                if (await this.accountVerificationCache.get(`setPassword${args.email}`)) {
                    this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN)
                }
                // send an email to user for account verification
                // TODO: Will send email verification code dynamically after settting up sendgrid templates
                // const isVerificationSent = await Mailer.sendEmailVerificationCode(args.email, code, 5) // code expiry time is 5 minute
                // if (!isVerificationSent) {
                // 	this.exceptionService.sendInternalServerErrorException(ResponseMessagesEnum.VerificationCodeFailed)
                // }
                await this.accountVerificationCache.set(`setPassword${args.email}`, '123456', 300000) // 5 * 60 * 1000 = 300000 seconds in MILLISECONDS (1000ms = 1s)
                msg = RESPONSE_MESSAGES.EMAIL_VERIFICATION_CODE_SENT
            } else {
                // TODO: if we support phone number in future
            }
            return msg
        } catch (error) {
            this.sharedService.sendError(error, this.sendSetPasswordCode.name)
        }
    }

    async resendEmail(args: ResendEmailDTO) {
        try {
            const admin = await this.adminModel.findOne({ email: args.email }).exec()
            if (!admin) this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.ADMIN_NOT_FOUND)

            // Resend Set password code (email or phone)
            const msg = await this.sendSetPasswordCode(args, admin)
            this.logger.log(`Verification code sent successfully for user ${admin._id}`, this.addAdmin.name)
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.resendEmail.name)
        }
    }

    async setPassword(args: SetPasswordDTO, admin?: Admin) {
        try {
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)
            if (args.email)
                await this.verifyAccountCode(`setPassword${args.email}`, args.code)

            admin = await this.adminModel.findOne({ email: args.email }).exec()
            if (admin.password !== process.env.DEFAULT_PASSWORD) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.PASSWORD_ALREADY_SET)
            }
            admin.password = this.sharedService.hashedPassword(args.password)
            admin.isEmailVerified = true
            await this.adminModel.updateOne({ _id: admin._id }, { password: admin.password, isEmailVerified: admin.isEmailVerified })
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PASSWORD_SET)
        } catch (error) {
            this.sharedService.sendError(error, this.setPassword.name)
        }
    }

    private async verifyAccountCode(key: string, verificationCode: string) {
        try {
            const code = await this.accountVerificationCache.get(key)
            if (!code)
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.CODE_EXPIRED)

            if (verificationCode !== code)
                this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.INVALID_CODE)

            await this.accountVerificationCache.del(key)

            return code
        } catch (error) {
            this.sharedService.sendError(error, this.verifyAccountCode.name)
        }
    }

    /**
     * Initiate forgot password process
     * @param args Email or phone for password recovery
     * @returns Success response
     */
    async forgotPassword(args: ForgotPasswordDTO) {
        try {
            this.logger.log(`Forgot password request for: ${args.email}`, this.forgotPassword.name)
            const admin: Admin = await this.adminModel.findOne({ email: args.email }).exec()
            if (!admin) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.ADMIN_NOT_FOUND)
            }
            if (!admin.isEmailVerified) {
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.EMAIL_UNVERIFIED)
            }

            const msg = await this.sendForgotPasswordCode(args)

            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.forgotPassword.name)
        }
    }

    private async sendForgotPasswordCode(args: RetryAccountVerificationDTO) {
        try {
            let msg: string
            // generate verification code
            const code = randomString.generate({ length: 6, charset: 'numeric' })
            this.logger.debug(`Reset password code generated for admin : ${args.email}`)
            if (args.email) {
                if (await this.accountVerificationCache.get(`resetPassword${args.email}`)) {
                    this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN)
                }
                // send an email to user for account verification
                // TODO: Will send email verification code dynamically after settting up sendgrid templates
                // const iscodeSent = await Mailer.sendForgotPasswordCode(args.email, code, 5) // code expiry time is 5 minute
                // if (!iscodeSent) {
                // 	this.exceptionService.sendInternalServerErrorException(ResponseMessagesEnum.EmailResendFailed)
                // }
                await this.accountVerificationCache.set(`resetPassword${args.email}`, '123456', 300000) // 5 * 60 * 1000 = 300000 seconds in MILLISECONDS (1000ms = 1s)
                msg = RESPONSE_MESSAGES.EMAIL_RESET_CODE_SENT
            } else {
                // TODO: will implement phone number logic
            }
            return msg
        } catch (error) {
            this.sharedService.sendError(error, this.sendForgotPasswordCode.name)
        }
    }

    /**
     * Reset admin password using token or code
     * @param args Reset password data with token
     * @returns Success response
     */
    async resetPassword(args: ResetPasswordDTO) {
        try {
            this.logger.log('Processing password reset request')
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)
            const admin = await this.adminModel.findOne({ email: args.email }).exec()
            if (!admin) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.ADMIN_NOT_FOUND)
            }

            // Verify the email verification code
            await this.verifyAccountCode(`resetPassword${args.email}`, args.code)
            this.logger.debug('Email verification code to reset password validated successfully', this.resetPassword.name)
            admin.password = this.sharedService.hashedPassword(args.password)
            await this.adminModel.updateOne({ _id: admin._id }, { password: admin.password })
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY)
        } catch (error) {
            this.sharedService.sendError(error, this.resetPassword.name)
        }
    }

    async changePassword(args: ChangePasswordDTO, admin: Admin) {
        try {
            if (args.password === args.oldPassword) {
                this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.PASS_CANT_SAME)
            }
            this.sharedService.bcryptCompareVerificatoin(args.oldPassword, admin.password)
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)
            const hashedPass = this.sharedService.hashedPassword(args.password)
            admin.password = hashedPass
            await this.adminModel.updateOne({ _id: admin._id }, { password: admin.password })
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY)
        } catch (error) {
            this.sharedService.sendError(error, this.changePassword.name)
        }
    }

    async blockAdminToggle(id: string, admin: Admin) {
        try {
            if (id === admin._id.toString()) {
                this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.SELF_BLOCKING_NOT_ALLOWED)
            }
            const adminInDB = await this.adminModel.findById(id).exec()
            if (!adminInDB) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.ADMIN_NOT_FOUND)
            }
            await this.adminModel.updateOne({ _id: id }, { isBlocked: !adminInDB.isBlocked })
            const msg = adminInDB.isBlocked ? RESPONSE_MESSAGES.ADMIN_UNBLOCKED : RESPONSE_MESSAGES.ADMIN_BLOCKED
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.blockAdminToggle.name)
        }
    }

    async getProfile(admin: Admin) {
        try {
            const data = this.getProfileData(admin)
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.SUCCESS, data)
        } catch (error) {
            this.sharedService.sendError(error, this.getProfile.name)
        }
    }

    async editProfile(args: EditProfileDTO, admin: Admin) {
        try {
            Object.assign(admin, args)
            await this.adminModel.updateOne({ _id: admin._id }, admin)
            const data = await this.getProfile(admin)
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PROFILE_UPDATED, data)
        } catch (error) {
            this.sharedService.sendError(error, this.getProfile.name)
        }
    }

    async updateAdminRole(args: UpdateAdminRoleDTO, admin: Admin) {
        try {
            if (args.id === admin._id.toString()) {
                this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.SELF_UPDATION_NOT_ALLOWED)
            }
            const adminMember = await this.adminModel.findById(args.id).exec()
            if (!adminMember) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.ADMIN_NOT_FOUND)
            }
            adminMember.role = args.role
            await this.adminModel.updateOne({ _id: adminMember._id }, { role: adminMember.role })
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.ROLE_UPDATED, { admin: adminMember })
        } catch (error) {
            this.sharedService.sendError(error, this.updateAdminRole.name)
        }
    }

    async adminsListing(args: AdminListingDTO) {
        try {
            let query: any = {}
            if (args.hasOwnProperty('isBlocked') && args.isBlocked !== undefined) {
                query['isBlocked'] = args.isBlocked
            }
            if (args.hasOwnProperty('isEmailVerified') && args.isEmailVerified !== undefined) {
                query['isEmailVerified'] = args.isEmailVerified
            }
            if (args.id) {
                query['_id'] = args.id
            }
            if (args.role) {
                query['role'] = args.role
            }
            if (args.search) {
                query['$or'] = [
                    { firstName: { $regex: args.search, $options: 'i' } },
                    { lastName: { $regex: args.search, $options: 'i' } },
                    { email: { $regex: args.search, $options: 'i' } }
                ]
            }
            
            const skip = args.pageNumber * args.pageSize
            const admins = await this.adminModel.find(query)
                .skip(skip)
                .limit(args.pageSize)
                .sort({ _id: -1 })
                .exec()
            
            const count = await this.adminModel.countDocuments(query).exec()
            
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.ADMIN_LISTING, { count, admins })
        } catch (error) {
            this.sharedService.sendError(error, this.adminsListing.name)
        }
    }

    private getProfileData(admin: Admin) {
        try {
            return {
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                role: admin.role,
            }
        } catch (error) {
            this.sharedService.sendError(error, this.getProfileData.name)
        }
    }

    private getPayload(admin: any) {
        return {
            email: admin.email,
            firstName: admin.firstName,
            role: admin.role,
            type: GuardsEnum.ADMIN,
        }
    }
}
