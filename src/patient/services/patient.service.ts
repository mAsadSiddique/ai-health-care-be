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
import { EditProfileDTO } from 'src/doctor/dtos/edit_profile.dto'
import { AddPatientDTO } from '../dtos/add_patient.dto'
import { Mailer } from '../../utils/mailer/mailer'

@Injectable()
export class PatientService {
    private readonly logger = new Logger(PatientService.name)

    constructor(
        @Inject(CACHE_MANAGER) private accountVerificationCache: any,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly exceptionService: ExceptionService,
        private readonly sharedService: SharedService
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

    async patientsListing(args: PaginationDTO & { search?: string, isBlocked?: boolean, isEmailVerified?: boolean }) {
        try {
            let query: any = { userType: UserType.PATIENT }
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

    async updatePatientDetail(id: string, args: EditProfileDTO) {
        try {
            const patient = await this.userModel.findOne({ _id: id, userType: UserType.PATIENT }).exec()
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
}

