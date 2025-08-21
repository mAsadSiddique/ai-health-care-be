import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { Role } from '../../auth/decorators/roles.decorator'
import { Roles } from '../../utils/enums/roles.enum'
import { GuardName } from '../../auth/decorators/guards.decorator'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { CommonAuthGuard } from '../../auth/guard/common-auth.guard'
import { RoleGuard } from '../../auth/guard/roles-auth.guard'
import { PatientService } from '../services/patient.service'
import { AddPatientDTO } from '../dtos/add_patient.dto'
import { PatientsListingDTO } from 'src/patient/dtos/patients_listing.dto'
import { IdDTO } from 'src/shared/dto/id.dto'
import { EditProfileDTO, UpdatePatientDTO } from 'src/doctor/dtos/edit_profile.dto'
import { user } from 'src/auth/decorators/user.decorator'
import { User } from 'src/user/entities/user.entity'

@ApiTags('doctor-patient')
@ApiBearerAuth('JWT')
@Controller('doctor/patient')
export class DoctorPatientController {
    constructor(
        private readonly patientService: PatientService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.PATIENT_REGISTERED })
    @ApiNotAcceptableResponse({ description: RESPONSE_MESSAGES.ALREADY_EXIST })
    @GuardName(GuardsEnum.DOCTOR)
    @UseGuards(CommonAuthGuard)
    @Post('/add')
    async addPatient(@Body() args: AddPatientDTO, @user() doctor: User) {
        return await this.patientService.addPatient(args, doctor)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.SUCCESS })
    @GuardName(GuardsEnum.DOCTOR)
    @UseGuards(CommonAuthGuard)
    @Get('/')
    async patientListing(@Query() args: PatientsListingDTO) {
        return await this.patientService.patientsListing(args)
    }

    @ApiOkResponse({ description: 'patient block/unblock successfully' })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.PATIENT_NOT_FOUND })
    @GuardName(GuardsEnum.DOCTOR)
    @UseGuards(CommonAuthGuard)
    @Put('/block/toggle')
    async blockPatientToggle(@Body() { id }: IdDTO) {
        return await this.patientService.blockPatientToggle(id)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.UPDATED })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.USER_NOT_FOUND })
    @GuardName(GuardsEnum.DOCTOR)
    @UseGuards(CommonAuthGuard)
    @Put('/')
    async updatePatient(@Body() args: UpdatePatientDTO) {
        return await this.patientService.updatePatientDetail(args)
    }
}
