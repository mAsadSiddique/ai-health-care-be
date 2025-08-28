import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common'
import { StatisticsService } from '../services/statistics.service'
import { 
    PatientStatsFilterDto, 
    AppointmentStatsFilterDto, 
    DoctorStatsFilterDto,
    GeneralStatsResponseDto,
    PatientStatsResponseDto,
    AppointmentStatsResponseDto,
    DoctorStatsResponseDto
} from '../dto/stats.dto'
import { CommonAuthGuard } from '../../auth/guard/common-auth.guard'
import { UserTypeAuthGuard } from '../../auth/guard/user-type-auth.guard'
import { UserTypeGuard } from '../../auth/decorators/user-type.decorator'
import { UserType } from '../../utils/enums/user-type.enum'
import { user } from 'src/auth/decorators/user.decorator'
import { User } from 'src/user/entities/user.entity'
import { ApiOperation } from '@nestjs/swagger'

@Controller('statistics')
@UseGuards(CommonAuthGuard, UserTypeAuthGuard)
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @ApiOperation({
        summary: 'Get General Statistics',
        description: 'Retrieves comprehensive general statistics including total counts of users (admins, doctors, patients), total doctor fees, and total doctor salaries. This endpoint is restricted to admin users only.'
    })
    @Get('general')
    @UserTypeGuard(UserType.ADMIN)
    async getGeneralStats(): Promise<GeneralStatsResponseDto> {
        return this.statisticsService.getGeneralStats()
    }

    @ApiOperation({
        summary: 'Get Patient Statistics',
        description: 'Retrieves detailed patient statistics based on provided filters. Returns patient counts, demographics, and other patient-related metrics. Accessible by admin and doctor users.'
    })
    @Get('patients')
    @UserTypeGuard(UserType.ADMIN, UserType.DOCTOR)
    async getPatientStats(@Query() filter: PatientStatsFilterDto): Promise<PatientStatsResponseDto> {
        return this.statisticsService.getPatientStats(filter)
    }

    @ApiOperation({
        summary: 'Get Appointment Statistics',
        description: 'Retrieves appointment statistics including total appointments, appointments by status (pending, completed, cancelled), and other appointment-related metrics. Accessible by admin, doctor, and patient users. Results are filtered based on the authenticated user\'s role and permissions.'
    })
    @Get('appointments')
    @UserTypeGuard(UserType.ADMIN, UserType.DOCTOR,UserType.PATIENT)
    async getAppointmentStats(@Query() filter: AppointmentStatsFilterDto, @user() user: User): Promise<AppointmentStatsResponseDto> {
        return this.statisticsService.getAppointmentStats(filter, user)
    }

    @ApiOperation({
        summary: 'Get Doctor Statistics',
        description: 'Retrieves comprehensive doctor statistics including total doctor count, performance metrics, and other doctor-related analytics. This endpoint is restricted to admin users only.'
    })
    @Get('doctors')
    @UserTypeGuard(UserType.ADMIN)
    async getDoctorStats(@Query() filter: DoctorStatsFilterDto): Promise<DoctorStatsResponseDto> {
        return this.statisticsService.getDoctorStats(filter)
    }

    @ApiOperation({
        summary: 'Get Revenue Statistics',
        description: 'Calculates and returns financial metrics including total doctor fees, total salaries, and net revenue (fees minus salaries). This endpoint is restricted to admin users only and provides a quick overview of the system\'s financial performance.'
    })
    @Get('revenue')
    @UserTypeGuard(UserType.ADMIN)
    async getRevenueStats(): Promise<{ totalDoctorFees: number; totalSalaries: number; netRevenue: number }> {
        const generalStats = await this.statisticsService.getGeneralStats()
        return {
            totalDoctorFees: generalStats.totalDoctorFees,
            totalSalaries: generalStats.totalDoctorSalaries,
            netRevenue: generalStats.totalDoctorFees - generalStats.totalDoctorSalaries
        }
    }

    @ApiOperation({
        summary: 'Get Dashboard Statistics',
        description: 'Retrieves consolidated dashboard statistics combining user counts, appointment counts, and financial metrics. This endpoint provides a comprehensive overview for admin dashboard displays, including user distribution, appointment status breakdown, and financial summary. Restricted to admin users only.'
    })
    @Get('dashboard')
    @UserTypeGuard(UserType.ADMIN)
    async getDashboardStats( @user() user: User): Promise<{
        userCounts: { admins: number; doctors: number; patients: number };
        appointmentCounts: { total: number; pending: number; completed: number };
        financials: { totalFees: number; totalSalaries: number; netRevenue: number };
    }> {
        const [generalStats, appointmentStats] = await Promise.all([
            this.statisticsService.getGeneralStats(),
            this.statisticsService.getAppointmentStats({},user)
        ])

        return {
            userCounts: {
                admins: generalStats.totalAdmins,
                doctors: generalStats.totalDoctors,
                patients: generalStats.totalPatients
            },
            appointmentCounts: {
                total: appointmentStats.totalAppointments,
                pending: appointmentStats.appointmentsByStatus.pending,
                completed: appointmentStats.appointmentsByStatus.completed
            },
            financials: {
                totalFees: generalStats.totalDoctorFees,
                totalSalaries: generalStats.totalDoctorSalaries,
                netRevenue: generalStats.totalDoctorFees - generalStats.totalDoctorSalaries
            }
        }
    }
}
