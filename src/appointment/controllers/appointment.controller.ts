import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger'
import { AppointmentService } from '../services/appointment.service'
import { BookAppointmentDTO } from '../dtos/book-appointment.dto'
import { UpdateAppointmentStatusDTO } from '../dtos/update-appointment-status.dto'
import { DoctorCreateAppointmentDTO } from '../dtos/doctor-create-appointment.dto'
import { AppointmentsListingDTO } from '../dtos/appointments-listing.dto'
import { CommonAuthGuard } from '../../auth/guard/common-auth.guard'
import { RoleGuard } from '../../auth/guard/roles-auth.guard'
import { GuardName } from '../../auth/decorators/guards.decorator'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { user } from '../../auth/decorators/user.decorator'
import { User } from 'src/user/entities/user.entity'

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(CommonAuthGuard)
@ApiBearerAuth()
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    @Post('book')
    @GuardName(GuardsEnum.PATIENT)
    @ApiOperation({ summary: 'Book an appointment with a doctor' })
    @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation error or conflict' })
    @ApiResponse({ status: 404, description: 'Doctor not found' })
    async bookAppointment(
        @Body() bookAppointmentDto: BookAppointmentDTO,
        @user() patient: User
    ) {
        return await this.appointmentService.bookAppointment(bookAppointmentDto, patient)
    }

    @Post('doctor/create')
    @GuardName(GuardsEnum.DOCTOR)
    @ApiOperation({ summary: 'Doctor creates an appointment for a patient' })
    @ApiResponse({ status: 201, description: 'Appointment created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation error or conflict' })
    @ApiResponse({ status: 404, description: 'Patient not found' })
    async doctorCreateAppointment(
        @Body() doctorCreateAppointmentDto: DoctorCreateAppointmentDTO,
        @user() doctor: User
    ) {
        return await this.appointmentService.doctorCreateAppointment(doctorCreateAppointmentDto, doctor)
    }

    @Put('doctor/status')
    @GuardName(GuardsEnum.DOCTOR)
    @ApiOperation({ summary: 'Update appointment status (approve/reject)' })
    @ApiParam({ name: 'id', description: 'Appointment ID' })
    @ApiResponse({ status: 200, description: 'Appointment status updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - invalid status transition' })
    @ApiResponse({ status: 404, description: 'Appointment not found' })
    async updateAppointmentStatus(
        @Body() args: UpdateAppointmentStatusDTO,
        @user() doctor: User
    ) {
        return await this.appointmentService.updateAppointmentStatus(args, doctor)
    }

    @Get('/')
    @GuardName(GuardsEnum.PATIENT)
    @ApiOperation({ summary: 'Get patient appointments with filters' })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] })
    @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'pageNumber', required: false, description: 'Page number (starts from 1)' })
    @ApiQuery({ name: 'pageSize', required: false, description: 'Items per page' })
    @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
    async getPatientAppointments(
        @Query() filters: AppointmentsListingDTO,
        @user() patient: User
    ) {
        return await this.appointmentService.getPatientAppointments(patient, filters)
    }

    @Get('doctor/')
    @GuardName(GuardsEnum.DOCTOR)
    @ApiOperation({ summary: 'Get doctor appointments with filters' })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] })
    @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'search', required: false, description: 'Search by patient name or email' })
    @ApiQuery({ name: 'pageNumber', required: false, description: 'Page number (starts from 1)' })
    @ApiQuery({ name: 'pageSize', required: false, description: 'Items per page' })
    @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
    async getDoctorAppointments(
        @Query() args: AppointmentsListingDTO,
        @user() doctor: User
    ) {
        return await this.appointmentService.getDoctorAppointments(doctor, args)
    }
}
