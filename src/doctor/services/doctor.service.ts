import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ExceptionService } from '../../shared/exception.service'
import { LoginDTO } from '../../shared/dto/login.dto'
import { SharedService } from '../../shared/shared.service'
import { AddDoctorDTO } from '../dtos/add_doctor.dto'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { Doctor, DoctorDocument } from '../entities/doctor.entity'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { Mailer } from '../../utils/mailer/mailer'
import { ResendEmailDTO } from '../dtos/resend_email.dto'
import { DoctorsListingDTO } from '../dtos/doctors_listing.dto'
import { EditProfileDTO } from '../dtos/edit_profile.dto'
import { ForgotPasswordDTO } from 'src/shared/dto/forgot_password.dto'
import { ChangePasswordDTO } from 'src/shared/dto/change_password.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { RetryAccountVerificationDTO } from '../dtos/retry_account_verification.dto'
import * as randomString from 'randomstring'
import { ResetPasswordDTO } from '../dtos/reset_password.dto'
import { SetPasswordDTO } from 'src/admin/dtos/set_password.dto'

@Injectable()
export class DoctorService {
    private readonly logger = new Logger(DoctorService.name)
    constructor(
        @Inject(CACHE_MANAGER) private accountVerificationCache: any,
        @InjectModel(Doctor.name)
        private readonly doctorModel: Model<DoctorDocument>,
        private readonly exceptionService: ExceptionService,
        private readonly sharedService: SharedService
    ) { }

    async login(args: LoginDTO) {
        try {
            const doctorInDB = await this.doctorModel.findOne({ email: args.email }).exec()
            if (!doctorInDB) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.DOCTOR_NOT_FOUND)
            }
            if (doctorInDB.isBlocked) {
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.USER_BLOCKED)
            }
            if (!doctorInDB.isEmailVerified) {
                this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.USER_EMAIL_UNVERIFIED)
            }
            this.sharedService.bcryptCompareVerificatoin(args.password, doctorInDB.password)
            const data: unknown = {}
            let payload: any = this.getPayload(doctorInDB)
            const jwtToken = this.sharedService.getJwt(payload)
            data['jwtToken'] = jwtToken
            payload = this.getProfileData(doctorInDB)
            data['doctor'] = payload
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.LOGGED_IN, data)
        } catch (error) {
            this.sharedService.sendError(error, this.login.name)
        }
    }

    async addDoctor(args: AddDoctorDTO) {
        try {
            const doctorInDb = await this.doctorModel.findOne({ email: args.email }).exec()
            if (doctorInDb) {
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.DOCTOR_ALREADY_EXIST)
            }

            // Generate random password that meets regex requirements
            const randomPassword = this.generateSecurePassword()

            const doctor: Doctor = new Doctor(args)
            // TODO: 'Doctor@123' will replace with random password in future
            doctor['password'] = this.sharedService.hashedPassword('Doctor@123')
            doctor['isEmailVerified'] = true // Set email as verified since we're sending credentials
            const newDoctor = new this.doctorModel(doctor)
            await newDoctor.save()

            // Send email with credentials
            const msg = await this.sendDoctorCredentials(args.email, randomPassword)
            this.logger.log(`Doctor credentials sent successfully for doctor ${newDoctor._id}`, this.addDoctor.name)
            return this.sharedService.sendResponse(msg)
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

    private async sendDoctorCredentials(email: string, password: string): Promise<string> {
        try {
            // TODO: Implement actual email sending logic
            // For now, we'll log the credentials and return success message
            this.logger.log(`Doctor credentials for ${email}: Password - ${password}`, this.sendDoctorCredentials.name)

            // Example email sending (uncomment when email service is configured)
            // const isEmailSent = await Mailer.sendDoctorCredentials(email, password)
            // if (!isEmailSent) {
            //     this.exceptionService.sendInternalServerErrorException('Failed to send doctor credentials email')
            // }

            return RESPONSE_MESSAGES.DOCTOR_REGISTERED
        } catch (error) {
            this.sharedService.sendError(error, this.sendDoctorCredentials.name)
        }
    }

    async sendSetPasswordCode(args: RetryAccountVerificationDTO, doctor: Doctor) {
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
            const doctor = await this.doctorModel.findOne({ email: args.email }).exec()
            if (!doctor) this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.DOCTOR_NOT_FOUND)

            // Resend Set password code (email or phone)
            const msg = await this.sendSetPasswordCode(args, doctor)
            this.logger.log(`Verification code sent successfully for doctor ${doctor._id}`, this.addDoctor.name)
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.resendEmail.name)
        }
    }

    async setPassword(args: SetPasswordDTO, doctor?: Doctor) {
        try {
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)
            if (args.email)
                await this.verifyAccountCode(`setPassword${args.email}`, args.code)

            doctor = await this.doctorModel.findOne({ email: args.email }).exec()
            if (doctor.password !== process.env.DEFAULT_PASSWORD) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.PASSWORD_ALREADY_SET)
            }
            doctor.password = this.sharedService.hashedPassword(args.password)
            doctor.isEmailVerified = true
            await this.doctorModel.updateOne({ _id: doctor._id }, { password: doctor.password, isEmailVerified: doctor.isEmailVerified })
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
            const doctor: Doctor = await this.doctorModel.findOne({ email: args.email }).exec()
            if (!doctor) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.DOCTOR_NOT_FOUND)
            }
            if (!doctor.isEmailVerified) {
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

    /**
     * Reset doctor password using token or code
     * @param args Reset password data with token
     * @returns Success response
     */
    async resetPassword(args: ResetPasswordDTO) {
        try {
            this.logger.log('Processing password reset request')
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)
            const doctor = await this.doctorModel.findOne({ email: args.email }).exec()
            if (!doctor) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.DOCTOR_NOT_FOUND)
            }

            // Verify the email verification code
            await this.verifyAccountCode(`resetPassword${args.email}`, args.code)
            this.logger.debug('Email verification code to reset password validated successfully', this.resetPassword.name)
            doctor.password = this.sharedService.hashedPassword(args.password)
            await this.doctorModel.updateOne({ _id: doctor._id }, { password: doctor.password })
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY)
        } catch (error) {
            this.sharedService.sendError(error, this.resetPassword.name)
        }
    }

    async changePassword(args: ChangePasswordDTO, doctor: Doctor) {
        try {
            if (args.password === args.oldPassword) {
                this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.PASS_CANT_SAME)
            }
            this.sharedService.bcryptCompareVerificatoin(args.oldPassword, doctor.password)
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)
            const hashedPass = this.sharedService.hashedPassword(args.password)
            doctor.password = hashedPass
            await this.doctorModel.updateOne({ _id: doctor._id }, { password: doctor.password })
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY)
        } catch (error) {
            this.sharedService.sendError(error, this.changePassword.name)
        }
    }

    async blockDoctorToggle(id: string, admin: any) {
        try {
            const doctorInDB = await this.doctorModel.findById(id).exec()
            if (!doctorInDB) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.DOCTOR_NOT_FOUND)
            }
            await this.doctorModel.updateOne({ _id: id }, { isBlocked: !doctorInDB.isBlocked })
            const msg = doctorInDB.isBlocked ? RESPONSE_MESSAGES.DOCTOR_UNBLOCKED : RESPONSE_MESSAGES.DOCTOR_BLOCKED
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.blockDoctorToggle.name)
        }
    }

    async getProfile(doctor: Doctor) {
        try {
            const data = this.getProfileData(doctor)
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.SUCCESS, data)
        } catch (error) {
            this.sharedService.sendError(error, this.getProfile.name)
        }
    }

    async editProfile(args: EditProfileDTO, doctor: Doctor) {
        try {
            Object.assign(doctor, args)
            await this.doctorModel.updateOne({ _id: doctor._id }, doctor)
            const data = await this.getProfile(doctor)
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.DOCTOR_PROFILE_UPDATED, data)
        } catch (error) {
            this.sharedService.sendError(error, this.editProfile.name)
        }
    }

    async doctorsListing(args: DoctorsListingDTO) {
        try {
            let query: any = {}
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
            const doctors = await this.doctorModel.find(query)
                .skip(skip)
                .limit(args.pageSize)
                .sort({ _id: -1 })
                .exec()

            const count = await this.doctorModel.countDocuments(query).exec()

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.DOCTOR_LISTING, { count, doctors })
        } catch (error) {
            this.sharedService.sendError(error, this.doctorsListing.name)
        }
    }

    private getProfileData(doctor: Doctor) {
        try {
            return {
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                email: doctor.email,
                phoneNumber: doctor.phoneNumber,
                specialization: doctor.specialization,
                licenseNumber: doctor.licenseNumber,
                experience: doctor.experience,
                qualification: doctor.qualification,
                address: doctor.address,
            }
        } catch (error) {
            this.sharedService.sendError(error, this.getProfileData.name)
        }
    }

    private getPayload(doctor: any) {
        return {
            email: doctor.email,
            firstName: doctor.firstName,
            type: GuardsEnum.DOCTOR,
        }
    }
}
