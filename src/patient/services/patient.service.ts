import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ExceptionService } from '../../shared/exception.service'
import { SharedService } from '../../shared/shared.service'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { User, UserDocument } from '../../user/entities/user.entity'
import { UserType } from '../../utils/enums/user-type.enum'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { PaginationDTO } from 'src/shared/dto/pagination.dto'
import { EditProfileDTO, UpdatePatientDTO } from 'src/doctor/dtos/edit_profile.dto'
import { AddPatientDTO } from '../dtos/add_patient.dto'
import { Mailer } from '../../utils/mailer/mailer'
import { AnalyzeDataDTO, DoctorAnalyzeDataDTO } from 'src/user/dtos/analyze_data.dto'
import { PatientAnalyzeData, PatientAnalyzeDataDocument } from 'src/user/entities/patient_analyze_data.entity'
import { SetPasswordDTO } from 'src/admin/dtos/set_password.dto'
import { ResendEmailDTO } from 'src/admin/dtos/resend_email.dto'
import { RetryAccountVerificationDTO } from 'src/admin/dtos/retry_account_verification.dto'
import * as randomString from 'randomstring'
import { SignupDTO } from '../dtos/signup.dto'
import { AccountVerificationDTO } from '../dtos/account_verification.dto'
import { AnalyzeDataListingDTO } from '../dtos/analyze_data_listing.dto'
import { StatisticsService } from '../../shared/services/statistics.service'

@Injectable()
export class PatientService {
    private readonly logger = new Logger(PatientService.name)

    constructor(
        @Inject(CACHE_MANAGER) private accountVerificationCache: any,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(PatientAnalyzeData.name)
        private readonly patiendAnalyzeDataModel: Model<PatientAnalyzeDataDocument>,
        private readonly exceptionService: ExceptionService,
        private readonly sharedService: SharedService,
        private readonly statisticsService: StatisticsService
    ) { }

    async addPatient(args: AddPatientDTO, doctor: User) {
        try {
            const patientInDb = await this.userModel.findOne({ email: args.email }).exec()
            if (patientInDb) {
                this.exceptionService.sendForbiddenException(`${patientInDb.userType} ${RESPONSE_MESSAGES.ALREADY_EXIST}`)
            }

            // Generate random password that meets regex requirements
            const randomPassword = this.generateSecurePassword()

            const patient: User = new User({
                ...args,
                userType: UserType.PATIENT,
                isEmailVerified: true,
                PatientDoctorId: doctor,
                password: this.sharedService.hashedPassword(randomPassword),
            })

            const newPatient = new this.userModel(patient)

            // Send welcome email with credentials
            const patientName = `${args.firstName || ''} ${args.lastName || ''}`.trim() || 'Patient'
            const isEmailSent = await Mailer.sendPatientCredentials(args.email, patientName, randomPassword)
            if (!isEmailSent) {
                this.exceptionService.sendInternalServerErrorException('Failed to send patient credentials email')
            }

            await newPatient.save()

            this.logger.log(`Patient credentials sent successfully for patient ${newPatient._id}`, this.addPatient.name)
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PATIENT_REGISTERED)
        } catch (error) {
            this.sharedService.sendError(error, this.addPatient.name)
        }
    }

    /**
     * Register a new user
     * @param args User signup data
     * @returns Response with success message
     */
    async signup(args: SignupDTO) {
        try {
            this.logger.log(`Attempting to register user with email: ${args.email || 'N/A'} or phone: ${args.phoneNumber || 'N/A'}`)

            // verify the password and confirm password are same
            if (args.password !== args.confirmPassword) {
                this.logger.warn('Password and confirm password do not match')
                this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED)
            }
            // Check if user already exists
            const patientInDb = await this.userModel.findOne({ email: args.email }).exec()
            if (patientInDb) {
                this.exceptionService.sendForbiddenException(`Patient ${RESPONSE_MESSAGES.ALREADY_EXIST}`)
            }
            const patient: User = new User({
                ...args,
                userType: UserType.PATIENT,
                isEmailVerified: false,
                password: this.sharedService.hashedPassword(args.password),
            })

            const newPatient = new this.userModel(patient)

            // Send verification code (email or phone)
            const msg = await this.sendAccountVerificationCode(args, newPatient)
            this.logger.log(`Verification code sent successfully for user ${newPatient._id.toString()}`, this.signup.name)
            await newPatient.save()
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.signup.name)
        }
    }

    async resendEmailOrSms(args: RetryAccountVerificationDTO) {
        try {
            this.logger.log(`Resend verification request for: ${args.email}`)
            const patientInDb = await this.userModel.findOne({ email: args.email }).exec()
            if (!patientInDb) {
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.PATIENT_NOT_FOUND)
            }
            const msg = await this.sendAccountVerificationCode(args, patientInDb)
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.resendEmailOrSms.name)
        }
    }

    async accountVerification(args: AccountVerificationDTO) {
        try {
            // Log the start of account verification process
            this.logger.log('Processing account verification request', this.accountVerification.name)
            this.logger.debug(`Verification attempt for: ${args.email}`, this.accountVerification.name)

            // Handle email verification flow
            this.logger.log('Starting email verification process', this.accountVerification.name)

            // Verify the email verification code
            await this.verifyAccountCode(`verify${args.email}`, args.code)
            this.logger.debug('Email verification code validated successfully', this.accountVerification.name)

            // Retrieve user by email
            const user = await this.userModel.findOne({ email: args.email }).exec()
            if (!user) {
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.PATIENT_NOT_FOUND)
            }
            this.logger.debug(`User found for email verification: ${user._id.toString()}`, this.accountVerification.name)

            // Check if email is already verified
            if (user.isEmailVerified) {
                this.logger.warn(`Email verification attempted for already verified user: ${user._id.toString()}`, this.accountVerification.name)
                this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.PATIENT_EMAIL_ALREADY_VERIFIED)
            }

            // Mark email as verified
            user.isEmailVerified = true
            this.logger.log(`Email marked as verified for user: ${user._id.toString()}`, this.accountVerification.name)

            if (user!.isBlocked) this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.USER_BLOCKED)

            // Update user status and verification flags in database
            // Perform database update
            await this.userModel.updateOne({ _id: user._id }, user)
            this.logger.log(`User verified successfully: ${user.id}`, this.accountVerification.name)
            this.logger.debug(`User verification status updated: ${user.isEmailVerified}`, this.accountVerification.name)

            // Return success response
            this.logger.log('Account verification completed successfully', this.accountVerification.name)
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.EMAIL_VERIFIED)
        } catch (error) {
            this.sharedService.sendError(error, this.accountVerification.name)
        }
    }

    async patientsListing(args: PaginationDTO & { search?: string, isBlocked?: boolean, isEmailVerified?: boolean }, doctor: User) {
        try {
            let query: any = { userType: UserType.PATIENT, PatientDoctorId: doctor._id }
            if (args.hasOwnProperty('isBlocked') && args.isBlocked !== undefined) {
                query['isBlocked'] = args.isBlocked
            }
            if (args.hasOwnProperty('isEmailVerified') && args.isEmailVerified !== undefined) {
                query['isEmailVerified'] = args.isEmailVerified
            }
            if (args.search) {
                query['$or'] = [
                    { firstName: { $regex: args.search, $options: 'i' } },
                    { lastName: { $regex: args.search, $options: 'i' } },
                    { email: { $regex: args.search, $options: 'i' } },
                    { phoneNumber: { $regex: args.search, $options: 'i' } }
                ]
            }

            const skip = args.pageNumber * args.pageSize
            const patients = await this.userModel.find(query)
                .populate({
                    path: 'analyzeData',
                    options: { sort: { createdAt: -1 } }
                })
                .populate({
                    path: 'PatientDoctorId',
                })
                .skip(skip)
                .limit(args.pageSize)
                .sort({ _id: -1 })
                .exec()

            const count = await this.userModel.countDocuments(query).exec()

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.SUCCESS, { count, patients })
        } catch (error) {
            this.sharedService.sendError(error, this.patientsListing.name)
        }
    }

    async updatePatientDetail(args: UpdatePatientDTO) {
        try {
            const patient = await this.userModel.findOne({ _id: args.id, userType: UserType.PATIENT }).exec()
            if (!patient) this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)

            Object.assign(patient, args)
            await this.userModel.updateOne({ _id: patient._id }, patient)

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.UPDATED, patient)
        } catch (error) {
            this.sharedService.sendError(error, this.updatePatientDetail.name)
        }
    }

    async blockPatientToggle(id: string) {
        try {

            const user = await this.userModel.findById(id).exec()
            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }
            if (user.userType !== UserType.PATIENT) {
                this.exceptionService.sendNotAcceptableException(`Action denied: Doctor cannot block ${user.userType}.`)
            }
            await this.userModel.updateOne({ _id: id }, { isBlocked: !user.isBlocked })
            const msg = user.isBlocked ? 'patient unblocked successfully' : 'patient blocked successfully'
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.blockPatientToggle.name)
        }
    }

    private generateSecurePassword(): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const lowercase = 'abcdefghijklmnopqrstuvwxyz'
        const numbers = '0123456789'
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

        let password = ''
        password += uppercase[Math.floor(Math.random() * uppercase.length)]
        password += lowercase[Math.floor(Math.random() * lowercase.length)]
        password += numbers[Math.floor(Math.random() * numbers.length)]
        password += specialChars[Math.floor(Math.random() * specialChars.length)]

        const allChars = uppercase + lowercase + numbers + specialChars
        for (let i = 4; i < 12; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)]
        }
        return password.split('').sort(() => Math.random() - 0.5).join('')
    }

    async patientAnalyze(args: DoctorAnalyzeDataDTO, doctor: User) {
        try {
            const patient = await this.userModel.findOne({ _id: args.patientId, userType: UserType.PATIENT }).exec()
            if (!patient) this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.PATIENT_NOT_FOUND)

            const analyzeData = new this.patiendAnalyzeDataModel(args)
            analyzeData.patientId = patient._id
            analyzeData.patientDoctorId = doctor._id
            await analyzeData.save()

            // Update patient condition based on health status
            if (args.analyzingResult?.data?.general_health_assessment?.health_status) {
                const healthStatus = args.analyzingResult.data.general_health_assessment.health_status
                await this.statisticsService.updatePatientCondition(patient._id.toString(), healthStatus)
            }

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.DATA_SAVED_SUCCESSFULLY, analyzeData)
        } catch (error) {
            this.sharedService.sendError(error, this.patientAnalyze.name)
        }
    }

    async patientAnalyzeItself(args: AnalyzeDataDTO, patient: User) {
        try {
            const analyzeData = new this.patiendAnalyzeDataModel(args)
            analyzeData.patientId = patient._id
            await analyzeData.save()

            // Update patient condition based on health status
            if (args.analyzingResult?.data?.general_health_assessment?.health_status) {
                const healthStatus = args.analyzingResult.data.general_health_assessment.health_status
                await this.statisticsService.updatePatientCondition(patient._id.toString(), healthStatus)
            }

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.DATA_SAVED_SUCCESSFULLY, analyzeData)
        } catch (error) {
            this.sharedService.sendError(error, this.patientAnalyzeItself.name)
        }
    }

    async sendAccountVerificationCode(args: RetryAccountVerificationDTO, user: User) {
        try {
            let msg: string
            // generate verification code
            const code = randomString.generate({ length: 6, charset: 'numeric' })
            this.logger.debug(`Verification code generated for user : ${args.email}`)
            if (args.email) {
                if (user.isEmailVerified) {
                    this.logger.warn(`User email already verified: ${user._id.toString()}`)
                    this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED)
                }
                if (await this.accountVerificationCache.get(`verify${args.email}`)) {
                    this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN)
                }
                // send an email to user for account verification
                const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Patient'
                const isVerificationSent = await Mailer.sendEmailVerificationCode(args.email, name, code) // code expiry time is 5 minute
                if (!isVerificationSent) {
                    this.exceptionService.sendInternalServerErrorException(RESPONSE_MESSAGES.VERIFICATION_CODE_FAILED)
                }
                await this.accountVerificationCache.set(`verify${args.email}`, code, 300000) // 5 * 60 * 1000 = 300000 seconds in MILLISECONDS (1000ms = 1s)
                msg = RESPONSE_MESSAGES.EMAIL_VERIFICATION_CODE_SENT
            }
            return msg
        } catch (error) {
            this.sharedService.sendError(error, this.sendAccountVerificationCode.name)
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

    async listAnalyzeData(filters: AnalyzeDataListingDTO, patient: User) {
        try {
            const query: any = { patientId: patient._id }

            // Apply optional filters
            if (filters.id) {
                query._id = filters.id
            }

            if (filters.doctorId) {
                query.patientDoctorId = filters.doctorId
            }

            const analyzeDataList = await this.patiendAnalyzeDataModel
                .find(query)
                .populate('patientDoctorId')
                .populate('patientId')
                .sort({ createdAt: -1 })
                .skip((filters.pageNumber) * filters.pageSize)
                .limit(filters.pageSize)

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.ANALYZE_DATA_LISTING, analyzeDataList)
        } catch (error) {
            this.sharedService.sendError(error, this.listAnalyzeData.name)
        }
    }

}

