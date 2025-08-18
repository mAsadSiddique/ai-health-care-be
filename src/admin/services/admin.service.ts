import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ExceptionService } from '../../shared/exception.service'
import { SharedService } from '../../shared/shared.service'
import { AddAdminDTO } from '../dtos/add_admin.dto'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { User, UserDocument } from '../../user/entities/user.entity'
import { UserType } from '../../utils/enums/user-type.enum'
import { Mailer } from '../../utils/mailer/mailer'
import { SetPasswordDTO } from '../dtos/set_password.dto'
import { ResendEmailDTO } from '../dtos/resend_email.dto'
import { AdminListingDTO } from '../dtos/admins_listing.dto'
import { UpdateAdminRoleDTO } from '../dtos/update_admin_role.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { RetryAccountVerificationDTO } from '../dtos/retry_account_verification.dto'
import * as randomString from 'randomstring'


@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name)
    constructor(
        @Inject(CACHE_MANAGER) private accountVerificationCache: any,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly exceptionService: ExceptionService,
        private readonly sharedService: SharedService
    ) { }



    async addAdmin(args: AddAdminDTO) {
        try {
            const adminInDb = await this.userModel.findOne({ email: args.email }).exec()
            if (adminInDb) {
                this.exceptionService.sendForbiddenException(`${adminInDb.userType} ${RESPONSE_MESSAGES.ALREADY_EXIST}`)
            }
            const admin: User = new User(args)

            // Generate random password that meets regex requirements
            const randomPassword = this.generateSecurePassword()

            admin['password'] = this.sharedService.hashedPassword(randomPassword)
            admin['isEmailVerified'] = true // Set email as verified since we're sending credentials
            admin['userType'] = UserType.ADMIN
            const newAdmin = new this.userModel(admin)

            // Send welcome email
            const isEmailSent = await Mailer.sendAdminCredentials(args.email, `${args.firstName || ''} ${args.lastName || ''}`, randomPassword)
            if (!isEmailSent) {
                this.exceptionService.sendInternalServerErrorException('Failed to send admin credentials email')
            }
            await newAdmin.save()
            this.logger.log(`Admin credentials sent successfully for admin ${newAdmin._id}`, this.addAdmin.name)
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.ADMIN_REGISTERED)
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

    async sendSetPasswordCode(args: RetryAccountVerificationDTO, user: User) {
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
            const admin = await this.userModel.findOne({ email: args.email, userType: UserType.ADMIN }).exec()
            if (!admin) this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.ADMIN_NOT_FOUND)

            // Resend Set password code (email or phone)
            const msg = await this.sendSetPasswordCode(args, admin)
            this.logger.log(`Verification code sent successfully for user ${admin._id}`, this.addAdmin.name)
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.resendEmail.name)
        }
    }

    async setPassword(args: SetPasswordDTO, admin?: User) {
        try {
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)
            if (args.email)
                await this.verifyAccountCode(`setPassword${args.email}`, args.code)

            admin = await this.userModel.findOne({ email: args.email, userType: UserType.ADMIN }).exec()
            if (admin.password !== process.env.DEFAULT_PASSWORD) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.PASSWORD_ALREADY_SET)
            }
            admin.password = this.sharedService.hashedPassword(args.password)
            admin.isEmailVerified = true
            await this.userModel.updateOne({ _id: admin._id }, { password: admin.password, isEmailVerified: admin.isEmailVerified })
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

    async blockAdminToggle(id: string, admin: User) {
        try {
            if (id === admin._id.toString()) {
                this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.SELF_BLOCKING_NOT_ALLOWED)
            }
            const user = await this.userModel.findById(id).exec()
            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }
            if (user.userType === UserType.PATIENT) {
                this.exceptionService.sendNotAcceptableException(`Action denied: Administrators cannot block patients.`)
            }
            await this.userModel.updateOne({ _id: id }, { isBlocked: !user.isBlocked })
            const msg = user.isBlocked ? `${user.userType} unblocked successfully` : `${user.userType} blocked successfully`
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.blockAdminToggle.name)
        }
    }



    async updateAdminRole(args: UpdateAdminRoleDTO, admin: User) {
        try {
            if (args.id === admin._id.toString()) {
                this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.SELF_UPDATION_NOT_ALLOWED)
            }
            const adminMember = await this.userModel.findById(args.id).exec()
            if (!adminMember) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.ADMIN_NOT_FOUND)
            }
            adminMember.role = args.role
            await this.userModel.updateOne({ _id: adminMember._id }, { role: adminMember.role })
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.ROLE_UPDATED, { admin: adminMember })
        } catch (error) {
            this.sharedService.sendError(error, this.updateAdminRole.name)
        }
    }

    async deleteUser(id: string, admin: User) {
        try {
            if (id === admin._id.toString()) {
                this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.SELF_DELETING_NOT_ALLOWED)
            }
            const user = await this.userModel.findById(id).exec()
            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }
            await this.userModel.deleteOne(
                { _id: user._id },
            )
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.USER_DELETED_SUCCESSFULLY)
        } catch (error) {
            this.sharedService.sendError(error, this.deleteUser.name)
        }
    }

    async adminsListing(args: AdminListingDTO) {
        try {
            let query: any = { userType: UserType.ADMIN }
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
            const admins = await this.userModel.find(query)
                .skip(skip)
                .limit(args.pageSize)
                .sort({ _id: -1 })
                .exec()
            
            const count = await this.userModel.countDocuments(query).exec()
            
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.ADMIN_LISTING, { count, admins })
        } catch (error) {
            this.sharedService.sendError(error, this.adminsListing.name)
        }
    }



    private getPayload(admin: any) {
        return {
            email: admin.email,
            firstName: admin.firstName,
            userType: admin.userType,
            role: admin.role,
        }
    }
}
