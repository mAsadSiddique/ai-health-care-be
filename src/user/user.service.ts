import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './entities/user.entity'
import { ChangePasswordDTO } from '../shared/dto/change_password.dto'
import { UserType } from '../utils/enums/user-type.enum'
import { RESPONSE_MESSAGES } from '../utils/enums/response_messages.enum'
import { ExceptionService } from '../shared/exception.service'
import { SharedService } from '../shared/shared.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject } from '@nestjs/common'
import * as randomString from 'randomstring'
import { Mailer } from 'src/utils/mailer/mailer'
import { LoginDTO } from 'src/shared/dto/login.dto'
import { ForgotPasswordDTO } from 'src/shared/dto/forgot_password.dto'
import { ResetPasswordDTO } from 'src/admin/dtos/reset_password.dto'
import { EditProfileDTO } from 'src/doctor/dtos/edit_profile.dto'
import { DoctorsListingDTO } from 'src/doctor/dtos/doctors_listing.dto'
import { UserListingDTO } from './dtos/user-listing.dto'

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)

    constructor(
        @Inject(CACHE_MANAGER) private accountVerificationCache: any,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly exceptionService: ExceptionService,
        private readonly sharedService: SharedService
    ) { }

    async login(args: LoginDTO) {
        try {
            const userInDB = await this.userModel.findOne({
                email: args.email
            }).exec()

            if (!userInDB) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }

            if (userInDB.isBlocked) {
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.USER_BLOCKED)
            }

            if (!userInDB.isEmailVerified) {
                this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.EMAIL_NOT_VERIFIED)
            }

            this.sharedService.bcryptCompareVerificatoin(args.password, userInDB.password)

            const data: unknown = {}
            let payload: any = this.getPayload(userInDB)
            const jwtToken = this.sharedService.getJwt(payload)
            data['jwtToken'] = jwtToken
            payload = this.getProfileData(userInDB)
            data['user'] = payload

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.LOGGED_IN, data)
        } catch (error) {
            this.sharedService.sendError(error, this.login.name)
        }
    }

    async forgotPassword(args: ForgotPasswordDTO) {
        try {
            this.logger.log(`Forgot password request for: ${args.email}`, this.forgotPassword.name)
            const user: User = await this.userModel.findOne({
                email: args.email
            }).exec()

            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }

            if (!user.isEmailVerified) {
                this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.EMAIL_NOT_VERIFIED)
            }

            const msg = await this.sendForgotPasswordCode(args, user)
            return this.sharedService.sendResponse(msg)
        } catch (error) {
            this.sharedService.sendError(error, this.forgotPassword.name)
        }
    }

    private async sendForgotPasswordCode(args: ForgotPasswordDTO, user: User) {
        try {
            let msg: string
            // generate verification code
            const code = randomString.generate({ length: 6, charset: 'numeric' })
            this.logger.debug(`Reset password code generated for user : ${args.email}`)

            if (args.email) {
                if (await this.accountVerificationCache.get(`resetPassword${args.email}`)) {
                    this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN)
                }
                // send an email to user for account verification
                const iscodeSent = await Mailer.forgotPassword(args.email, `${user.firstName || ''} ${user.lastName || ''}`, code) // code expiry time is 5 minute
                if (!iscodeSent) {
                    this.exceptionService.sendInternalServerErrorException(RESPONSE_MESSAGES.EMAIL_RESEND_FAILED)
                }
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

    async resetPassword(args: ResetPasswordDTO) {
        try {
            this.logger.log('Processing password reset request')
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)

            const user = await this.userModel.findOne({
                email: args.email
            }).exec()

            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }

            // Verify the email verification code
            await this.verifyAccountCode(`resetPassword${args.email}`, args.code)
            this.logger.debug('Email verification code to reset password validated successfully', this.resetPassword.name)

            user.password = this.sharedService.hashedPassword(args.password)
            await this.userModel.updateOne({ _id: user._id }, { password: user.password })

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY)
        } catch (error) {
            this.sharedService.sendError(error, this.resetPassword.name)
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

    async changePassword(args: ChangePasswordDTO, userId: string) {
        try {
            if (args.password === args.oldPassword) {
                this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.PASS_CANT_SAME)
            }

            const user = await this.userModel.findById(userId).exec()
            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }

            this.sharedService.bcryptCompareVerificatoin(args.oldPassword, user.password)
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword)

            const hashedPass = this.sharedService.hashedPassword(args.password)
            user.password = hashedPass
            await this.userModel.updateOne({ _id: user._id }, { password: user.password })

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY)
        } catch (error) {
            this.sharedService.sendError(error, this.changePassword.name)
        }
    }

    async getProfile(userId: string) {
        try {
            const user = await this.userModel.findById(userId).exec()
            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }

            const data = this.getProfileData(user)
            return this.sharedService.sendResponse(RESPONSE_MESSAGES.SUCCESS, data)
        } catch (error) {
            this.sharedService.sendError(error, this.getProfile.name)
        }
    }

    async editProfile(args: EditProfileDTO, userId: string) {
        try {
            const user = await this.userModel.findById(userId).exec()
            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }

            Object.assign(user, args)
            await this.userModel.updateOne({ _id: user._id }, user)

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.PROFILE_UPDATED, user)
        } catch (error) {
            this.sharedService.sendError(error, this.editProfile.name)
        }
    }

    async findById(userId: string): Promise<User> {
        try {
            const user = await this.userModel.findById(userId).exec()
            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }
            return user
        } catch (error) {
            this.sharedService.sendError(error, this.findById.name)
        }
    }

    async findByEmailAndType(email: string, userType: UserType): Promise<User> {
        try {
            const user = await this.userModel.findOne({ email, userType }).exec()
            if (!user) {
                this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND)
            }
            return user
        } catch (error) {
            this.sharedService.sendError(error, this.findByEmailAndType.name)
        }
    }

    private getProfileData(user: User) {
        try {
            return {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                userType: user.userType,
                role: user.role,
                specialization: user.specialization,
                licenseNumber: user.licenseNumber,
                experience: user.experience,
                qualification: user.qualification,
                address: user.address,
                isEmailVerified: user.isEmailVerified,
                isTwoFaEnable: user.isTwoFaEnable,
                createdAt: user.createdAt,
            }
        } catch (error) {
            this.sharedService.sendError(error, this.getProfileData.name)
        }
    }

    private getPayload(user: any) {
        return {
            email: user.email,
            firstName: user.firstName,
            userType: user.userType,
            role: user.role,
        }
    }

    async userListing(args: UserListingDTO) {
        try {
            let query: any = {}

            if (args.userType) {
                query['userType'] = args.userType
            }

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

            return this.sharedService.sendResponse(RESPONSE_MESSAGES.DOCTOR_LISTING, { count, doctors })
        } catch (error) {
            this.sharedService.sendError(error, this.userListing.name)
        }
    }
}
