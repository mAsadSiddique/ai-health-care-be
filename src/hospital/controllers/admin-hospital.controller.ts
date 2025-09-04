import { Body, Controller, Post, Put, Get, Query, UseGuards, Param, Delete } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from 'src/utils/enums/response_messages.enum'
import { HospitalService } from '../services/hospital.service'
import { GuardName } from 'src/auth/decorators/guards.decorator'
import { GuardsEnum } from 'src/utils/enums/guards.enum'
import { CommonAuthGuard } from 'src/auth/guard/common-auth.guard'
import { AddHospitalDTO } from '../dtos/add-hospital.dto'
import { UpdateHospitalDTO } from '../dtos/update-hospital.dto'
import { HospitalsListingDTO } from '../dtos/hospitals-listing.dto'
import { RoleGuard } from 'src/auth/guard/roles-auth.guard'
import { Roles } from 'src/utils/enums/roles.enum'
import { Role } from 'src/auth/decorators/roles.decorator'
import { IdDTO } from 'src/shared/dto/id.dto'

@ApiTags('admin-hospital')
@Controller('admin/hospital')
export class AdminHospitalController {
    constructor(
        private readonly hospitalService: HospitalService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.DATA_SAVED_SUCCESSFULLY })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Post('/')
    async addHospital(@Body() args: AddHospitalDTO) {
        return await this.hospitalService.addHospital(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.DATA_UPDATED_SUCCESSFULLY })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Put('/')
    async updateHospital(@Body() args: UpdateHospitalDTO) {
        return await this.hospitalService.updateHospital(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.DATA_DELETED_SUCCESSFULLY })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Delete('/')
    async deleteHospital(@Body() { id }: IdDTO) {
        return await this.hospitalService.deleteHospital(id)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.SUCCESS })
    @Role(Roles.SUPER, Roles.SUB)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Get('/')
    async listHospitals(@Query() filters: HospitalsListingDTO) {
        return await this.hospitalService.listHospitals(filters)
    }
}

