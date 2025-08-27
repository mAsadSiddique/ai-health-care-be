import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { DoctorService } from '../services/doctor.service'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { DoctorsListingDTO } from '../dtos/doctors_listing.dto'
import { GuardName } from '../../auth/decorators/guards.decorator'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { CommonAuthGuard } from '../../auth/guard/common-auth.guard'
import { UserTypeGuard } from 'src/auth/decorators/user-type.decorator'
import { UserType } from 'src/utils/enums/user-type.enum'

@ApiTags('doctor')
@ApiBearerAuth('JWT')
@Controller('doctor')
export class DoctorController {
    constructor(
        private readonly doctorService: DoctorService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.DOCTOR_LISTING })
    @UserTypeGuard(UserType.PATIENT, UserType.DOCTOR)
    @Get('/')
    async doctorListing(@Query() args: DoctorsListingDTO) {
        return await this.doctorService.doctorsListing(args)
    }
}
