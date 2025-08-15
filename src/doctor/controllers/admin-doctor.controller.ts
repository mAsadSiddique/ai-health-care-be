import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common'
import { DoctorService } from '../services/doctor.service'
import { ApiBearerAuth, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { AddDoctorDTO } from '../dtos/add_doctor.dto'
import { Role } from '../../auth/decorators/roles.decorator'
import { Roles } from '../../utils/enums/roles.enum'
import { GuardName } from '../../auth/decorators/guards.decorator'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { CommonAuthGuard } from '../../auth/guard/common-auth.guard'
import { RoleGuard } from '../../auth/guard/roles-auth.guard'
import { DoctorsListingDTO } from '../dtos/doctors_listing.dto'

@ApiTags('admin-doctor')
@ApiBearerAuth('JWT')
@Controller('admin/doctor')
export class AdminDoctorController {
    constructor(
        private readonly doctorService: DoctorService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.DOCTOR_REGISTERED })
    @ApiNotAcceptableResponse({ description: RESPONSE_MESSAGES.DOCTOR_ALREADY_EXIST })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Post('/add')
    async addDoctor(@Body() args: AddDoctorDTO) {
        return await this.doctorService.addDoctor(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.DOCTOR_LISTING })
    @Role(Roles.SUPER, Roles.SUB)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Get('/')
    async doctorListing(@Query() args: DoctorsListingDTO) {
        return await this.doctorService.doctorsListing(args)
    }
}
