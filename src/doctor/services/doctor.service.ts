import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ExceptionService } from '../../shared/exception.service'
import { SharedService } from '../../shared/shared.service'
import { AddDoctorDTO } from '../dtos/add_doctor.dto'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { User, UserDocument } from '../../user/entities/user.entity'
import { UserType } from '../../utils/enums/user-type.enum'
import { Mailer } from '../../utils/mailer/mailer'
import { ResendEmailDTO } from '../dtos/resend_email.dto'
import { DoctorsListingDTO } from '../dtos/doctors_listing.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { RetryAccountVerificationDTO } from '../dtos/retry_account_verification.dto'
import * as randomString from 'randomstring'
import { SetPasswordDTO } from 'src/admin/dtos/set_password.dto'

@Injectable()
export class DoctorService {
    private readonly logger = new Logger(DoctorService.name)
    constructor(
        @Inject(CACHE_MANAGER) private accountVerificationCache: any,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly exceptionService: ExceptionService,
        private readonly sharedService: SharedService
    ) { }



    async addDoctor(args: AddDoctorDTO) {
        try {
            const doctorInDb = await this.userModel.findOne({ email: args.email }).exec()
            if (doctorInDb) {
                this.exceptionService.sendForbiddenException(`${doctorInDb.userType} ${RESPONSE_MESSAGES.ALREADY_EXIST}`)
            }

            // Generate random password that meets regex requirements
            const randomPassword = this.generateSecurePassword()

            const doctor: User = new User(args)
            // TODO: 'Doctor@123' will replace with random password in future
            doctor['password'] = this.sharedService.hashedPassword(randomPassword)
            doctor['isEmailVerified'] = true // Set email as verified since we're sending credentials
            doctor['userType'] = UserType.DOCTOR
            const newDoctor = new this.userModel(doctor)

            // Send welcome email
            const isEmailSent = await Mailer.sendDoctorCredentials(args.email, `${args.firstName || ''} ${args.lastName || ''}`, randomPassword)
            if (!isEmailSent) {
                this.exceptionService.sendInternalServerErrorException('Failed to send doctor credentials email')
            }
            await newDoctor.save()

            this.logger.log(`Doctor credentials sent successfully for doctor ${newDoctor._id}`, this.addDoctor.name)
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.DOCTOR_REGISTERED)
        } catch (error) {
            this.sharedService.sendError(error, this.addDoctor.name)
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

    async sendSetPasswordCode(args: RetryAccountVerificationDTO, doctor: User) {
        try {
            let msg: string
            // generate verification code
            const code = randomString.generate({ length: 6, charset: 'numeric' })
            this.logger.debug(`Set Password code generated for doctor : ${args.email}`)
            if (args.email) {
                if (doctor.isEmailVerified) {
                    this.logger.warn(`Doctor email already verified: ${doctor._id}`)
                    this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.DOCTOR_EMAIL_ALREADY_VERIFIED)
                }
                if (await this.accountVerificationCache.get(`setPassword${args.email}`)) {
                    this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN)
                }
                // send an email to doctor for account verification
                // TODO: Will send email verification code dynamically after setting up sendgrid templates
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
            const doctor = await this.userModel.findOne({ email: args.email, userType: UserType.DOCTOR }).exec()
            if (!doctor) this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.DOCTOR_NOT_FOUND)

            // Resend Set password code (email or phone)
            const msg = await this.sendSetPasswordCode(args, doctor)
            this.logger.log(`Verification code sent successfully for doctor ${doctor._id}`, this.addDoctor.name)
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.resendEmail.name)
        }
    }

    async setPassword(args: SetPasswordDTO, doctor?: User) {
        try {
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)
            if (args.email)
                await this.verifyAccountCode(`setPassword${args.email}`, args.code)

            doctor = await this.userModel.findOne({ email: args.email, userType: UserType.DOCTOR }).exec()
            if (doctor.password !== process.env.DEFAULT_PASSWORD) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.PASSWORD_ALREADY_SET)
            }
            doctor.password = this.sharedService.hashedPassword(args.password)
            doctor.isEmailVerified = true
            await this.userModel.updateOne({ _id: doctor._id }, { password: doctor.password, isEmailVerified: doctor.isEmailVerified })
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



    private async sendForgotPasswordCode(args: RetryAccountVerificationDTO) {
        try {
            let msg: string
            // generate verification code
            const code = randomString.generate({ length: 6, charset: 'numeric' })
            this.logger.debug(`Reset password code generated for doctor : ${args.email}`)
            if (args.email) {
                if (await this.accountVerificationCache.get(`resetPassword${args.email}`)) {
                    this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN)
                }
                // send an email to doctor for account verification
                // TODO: Will send email verification code dynamically after setting up sendgrid templates
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

    async doctorsListing(args: DoctorsListingDTO) {
        try {
            let query: any = { userType: UserType.DOCTOR }

            if (args.hasOwnProperty('isBlocked') && args.isBlocked !== undefined) {
                query['isBlocked'] = args.isBlocked
            }
            if (args.hasOwnProperty('isEmailVerified') && args.isEmailVerified !== undefined) {
                query['isEmailVerified'] = args.isEmailVerified
            }
            if (args.specialization) {
                query['specialization'] = { $regex: args.specialization, $options: 'i' }
            }
            if (args.qualification) {
                query['qualification'] = { $regex: args.qualification, $options: 'i' }
            }
            if (args.minExperience !== undefined || args.maxExperience !== undefined) {
                query['experience'] = {}
                if (args.minExperience !== undefined) {
                    query['experience']['$gte'] = args.minExperience
                }
                if (args.maxExperience !== undefined) {
                    query['experience']['$lte'] = args.maxExperience
                }
            }
            if (args.search) {
                query['$or'] = [
                    { firstName: { $regex: args.search, $options: 'i' } },
                    { lastName: { $regex: args.search, $options: 'i' } },
                    { email: { $regex: args.search, $options: 'i' } },
                    { specialization: { $regex: args.search, $options: 'i' } }
                ]
            }

            const skip = args.pageNumber * args.pageSize
            const doctors = await this.userModel.find(query)
                .skip(skip)
                .limit(args.pageSize)
                .sort({ _id: -1 })
                .exec()

            const count = await this.userModel.countDocuments(query).exec()

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.DOCTOR_LISTING, { count, doctors })
        } catch (error) {
            this.sharedService.sendError(error, this.doctorsListing.name)
        }
    }

}
