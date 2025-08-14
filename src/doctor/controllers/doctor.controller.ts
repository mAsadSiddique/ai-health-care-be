import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common'
import { DoctorService } from '../services/doctor.service'
import { ApiBearerAuth, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { LoginDTO } from '../../shared/dto/login.dto'
import { ResendEmailDTO } from '../dtos/resend_email.dto'
import { DoctorsListingDTO } from '../dtos/doctors_listing.dto'
import { GuardName } from '../../auth/decorators/guards.decorator'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { CommonAuthGuard } from '../../auth/guard/common-auth.guard'
import { user } from '../../auth/decorators/user.decorator'
import { Doctor } from '../entities/doctor.entity'
import { EditProfileDTO } from '../dtos/edit_profile.dto'
import { ForgotPasswordDTO } from 'src/shared/dto/forgot_password.dto'
import { ChangePasswordDTO } from 'src/shared/dto/change_password.dto'
import { ResetPasswordDTO } from '../dtos/reset_password.dto'

@ApiTags('doctor')
@ApiBearerAuth('JWT')
@Controller('doctor')
export class DoctorController {
    constructor(
        private readonly doctorService: DoctorService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.SUCCESS })
    @Post('/login')
    async login(@Body() args: LoginDTO) {
        return await this.doctorService.login(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.SUCCESS })
    @GuardName(GuardsEnum.DOCTOR)
    @UseGuards(CommonAuthGuard)
    @Get('/profile')
    async viewProfile(@user() doctor: Doctor) {
        return await this.doctorService.getProfile(doctor)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.DOCTOR_PROFILE_UPDATED })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.DOCTOR_NOT_FOUND })
    @GuardName(GuardsEnum.DOCTOR)
    @UseGuards(CommonAuthGuard)
    @Put('/edit')
    async editProfile(@Body() args: EditProfileDTO, @user() doctor: Doctor) {
        return await this.doctorService.editProfile(args, doctor)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.FORGOT_PASSWORD_REQUEST })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.DOCTOR_NOT_FOUND })
    @Post('/forgot/password')
    async forgotPassword(@Body() args: ForgotPasswordDTO) {
        return await this.doctorService.forgotPassword(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.JWT_INVALID })
    @Put('/reset/password')
    async forgotPasswordUpdation(@Body() args: ResetPasswordDTO) {
        return await this.doctorService.resetPassword(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY })
    @ApiNotAcceptableResponse({ description: RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED })
    @GuardName(GuardsEnum.DOCTOR)
    @UseGuards(CommonAuthGuard)
    @Put('/change/password')
    async changePassword(@Body() args: ChangePasswordDTO, @user() doctor: Doctor) {
        return await this.doctorService.changePassword(args, doctor)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.DOCTOR_LISTING })
    @GuardName(GuardsEnum.DOCTOR)
    @UseGuards(CommonAuthGuard)
    @Get('/')
    async doctorListing(@Query() args: DoctorsListingDTO) {
        return await this.doctorService.doctorsListing(args)
    }
}
