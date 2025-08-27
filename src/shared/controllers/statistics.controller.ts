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

@Controller('statistics')
@UseGuards(CommonAuthGuard, UserTypeAuthGuard)
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Get('general')
    @UserTypeGuard(UserType.ADMIN)
    async getGeneralStats(): Promise<GeneralStatsResponseDto> {
        return this.statisticsService.getGeneralStats()
    }

    @Get('patients')
    @UserTypeGuard(UserType.ADMIN, UserType.DOCTOR)
    async getPatientStats(@Query() filter: PatientStatsFilterDto): Promise<PatientStatsResponseDto> {
        return this.statisticsService.getPatientStats(filter)
    }

    @Get('appointments')
    @UserTypeGuard(UserType.ADMIN, UserType.DOCTOR,UserType.PATIENT)
    async getAppointmentStats(@Query() filter: AppointmentStatsFilterDto, @user() user: User): Promise<AppointmentStatsResponseDto> {
        return this.statisticsService.getAppointmentStats(filter, user)
    }

    @Get('doctors')
    @UserTypeGuard(UserType.ADMIN)
    async getDoctorStats(@Query() filter: DoctorStatsFilterDto): Promise<DoctorStatsResponseDto> {
        return this.statisticsService.getDoctorStats(filter)
    }

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
