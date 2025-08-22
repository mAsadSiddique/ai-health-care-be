import { Body, Controller, Post, Put, Get, Query, UseGuards, Param } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from 'src/utils/enums/response_messages.enum'
import { PatientService } from '../services/patient.service'
import { GuardName } from 'src/auth/decorators/guards.decorator'
import { GuardsEnum } from 'src/utils/enums/guards.enum'
import { CommonAuthGuard } from 'src/auth/guard/common-auth.guard'
import { AnalyzeDataDTO } from 'src/user/dtos/analyze_data.dto'
import { user } from 'src/auth/decorators/user.decorator'
import { User } from 'src/user/entities/user.entity'
import { SignupDTO } from '../dtos/signup.dto'
import { AccountVerificationDTO } from '../dtos/account_verification.dto'
import { RetryAccountVerificationDTO } from 'src/admin/dtos/retry_account_verification.dto'
import { AnalyzeDataListingDTO } from '../dtos/analyze_data_listing.dto'

@ApiTags('patient')
@Controller('patient')
export class PatientController {
    constructor(
        private readonly patientService: PatientService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.DATA_SAVED_SUCCESSFULLY })
    @GuardName(GuardsEnum.PATIENT)
    @UseGuards(CommonAuthGuard)
    @Post('/analyze')
    async patientAnalyzeItself(@Body() args: AnalyzeDataDTO, @user() patient: User) {
        return await this.patientService.patientAnalyzeItself(args, patient)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.SUCCESS })
    @GuardName(GuardsEnum.PATIENT)
    @UseGuards(CommonAuthGuard)
    @Get('/analyze/data')
    async listAnalyzeData(@Query() filters: AnalyzeDataListingDTO, @user() patient: User) {
        return await this.patientService.listAnalyzeData(filters, patient)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.EMAIL_VERIFICATION_CODE_SENT })
    @Post('/signup')
    async signup(@Body() args: SignupDTO) {
        return await this.patientService.signup(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.EMAIL_VERIFIED })
    @Put('/account/verification')
    async accountVerification(@Body() args: AccountVerificationDTO) {
        return await this.patientService.accountVerification(args)
    }

    @Post('/resend/account/verification')
    async resendEmailOrSms(@Body() args: RetryAccountVerificationDTO) {
        return await this.patientService.resendEmailOrSms(args)
    }
}

