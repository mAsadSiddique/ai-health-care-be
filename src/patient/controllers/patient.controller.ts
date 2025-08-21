import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from 'src/utils/enums/response_messages.enum'
import { PatientService } from '../services/patient.service'
import { GuardName } from 'src/auth/decorators/guards.decorator'
import { GuardsEnum } from 'src/utils/enums/guards.enum'
import { CommonAuthGuard } from 'src/auth/guard/common-auth.guard'
import { AnalyzeDataDTO } from 'src/user/dtos/analyze_data.dto'
import { user } from 'src/auth/decorators/user.decorator'
import { User } from 'src/user/entities/user.entity'

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
}

