import { Controller, Get, Put, Delete, Param, Query, UseGuards, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger'
import { AppointmentService } from '../services/appointment.service'
import { CommonAuthGuard } from '../../auth/guard/common-auth.guard'
import { RoleGuard } from '../../auth/guard/roles-auth.guard'
import { Role } from '../../auth/decorators/roles.decorator'
import { Roles } from '../../utils/enums/roles.enum'
import { GuardName } from '../../auth/decorators/guards.decorator'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { AppointmentsListingDTO, DoctorAppointmentsListingDTO } from '../dtos/appointments-listing.dto'
import { UpdateAppointmentStatusDTO } from '../dtos/update-appointment-status.dto'

@ApiTags('Admin-Appointments')
@Controller('admin/appointments')
@Role(Roles.SUPER, Roles.SUB)
@GuardName(GuardsEnum.ADMIN)
@UseGuards(CommonAuthGuard, RoleGuard)
@ApiBearerAuth()
export class AdminAppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    @Get()
    @ApiOperation({ summary: 'Get all appointments with filters (Admin only)' })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] })
    @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'search', required: false, description: 'Search by patient or doctor name/email' })
    @ApiQuery({ name: 'pageNumber', required: false, description: 'Page number (starts from 1)' })
    @ApiQuery({ name: 'pageSize', required: false, description: 'Items per page' })
    @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
    async getAllAppointments(@Query() filters: DoctorAppointmentsListingDTO) {
        return await this.appointmentService.getAllAppointments(filters)
    }

    // @Put('/status')
    // @ApiOperation({ summary: 'Update appointment status (Admin only)' })
    // @ApiParam({ name: 'id', description: 'Appointment ID' })
    // @ApiResponse({ status: 200, description: 'Appointment status updated successfully' })
    // @ApiResponse({ status: 400, description: 'Bad request - invalid status transition' })
    // @ApiResponse({ status: 404, description: 'Appointment not found' })
    // async updateAppointmentStatus(
    //     @Param('id') id: string,
    //     @Body() updateStatusDto: UpdateAppointmentStatusDTO
    // ) {
    //     return await this.appointmentService.updateAppointmentStatusByAdmin(id, updateStatusDto)
    // }

    // @Delete(':id')
    // @ApiOperation({ summary: 'Delete appointment (Admin only)' })
    // @ApiParam({ name: 'id', description: 'Appointment ID' })
    // @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
    // @ApiResponse({ status: 404, description: 'Appointment not found' })
    // async deleteAppointment(@Param('id') id: string) {
    //     return await this.appointmentService.deleteAppointment(id)
    // }
}
