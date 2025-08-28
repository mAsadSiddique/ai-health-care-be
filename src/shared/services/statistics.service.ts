import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User, UserDocument } from '../../user/entities/user.entity'
import { Appointment, AppointmentDocument } from '../../appointment/entities/appointment.entity'
import { PatientAnalyzeData, PatientAnalyzeDataDocument } from '../../user/entities/patient_analyze_data.entity'
import { UserType } from '../../utils/enums/user-type.enum'
import { PatientCondition } from '../../utils/enums/patient-condition.enum'
import { AppointmentStatus } from '../../utils/enums/appointment-status.enum'
import { 
    GeneralStatsResponseDto, 
    PatientStatsResponseDto, 
    AppointmentStatsResponseDto, 
    DoctorStatsResponseDto,
    PatientStatsFilterDto,
    AppointmentStatsFilterDto,
    DoctorStatsFilterDto
} from '../dto/stats.dto'

@Injectable()
export class StatisticsService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
        @InjectModel(PatientAnalyzeData.name) private patientAnalyzeDataModel: Model<PatientAnalyzeDataDocument>
    ) {}

    async getGeneralStats(): Promise<GeneralStatsResponseDto> {
        const [
            totalAdmins,
            totalDoctors,
            totalPatients,
            totalAppointments,
            totalDoctorFees,
            totalDoctorSalaries
        ] = await Promise.all([
            this.userModel.countDocuments({ userType: UserType.ADMIN, deletedAt: null }),
            this.userModel.countDocuments({ userType: UserType.DOCTOR, deletedAt: null }),
            this.userModel.countDocuments({ userType: UserType.PATIENT, deletedAt: null }),
            this.appointmentModel.countDocuments({ deletedAt: null }),
            this.appointmentModel.aggregate([
                { $match: { deletedAt: null } },
                { $group: { _id: null, total: { $sum: '$doctorFee' } } }
            ]),
            this.userModel.aggregate([
                { $match: { userType: UserType.DOCTOR, deletedAt: null } },
                { $group: { _id: null, total: { $sum: '$salary.salary' } } }
            ])
        ])

        return {
            totalAdmins,
            totalDoctors,
            totalPatients,
            totalAppointments,
            totalDoctorFees: totalDoctorFees[0]?.total || 0,
            totalDoctorSalaries: totalDoctorSalaries[0]?.total || 0
        }
    }

    async getPatientStats(filter: PatientStatsFilterDto): Promise<PatientStatsResponseDto> {
        const matchStage: any = { userType: UserType.PATIENT, deletedAt: null }
        
        if (filter.patientCondition) {
            matchStage.patientCondition = filter.patientCondition
        }

        const [totalPatients, patientsByCondition] = await Promise.all([
            this.userModel.countDocuments(matchStage),
            this.userModel.aggregate([
                { $match: { userType: UserType.PATIENT, deletedAt: null } },
                { $group: { _id: '$patientCondition', count: { $sum: 1 } } }
            ])
        ])

        const conditionCounts = {
            [PatientCondition.NOT_ANALYZED]: 0,
            [PatientCondition.NORMAL]: 0,
            [PatientCondition.WARNING]: 0,
            [PatientCondition.CRITICAL]: 0
        }

        patientsByCondition.forEach(item => {
            conditionCounts[item._id] = item.count
        })

        return {
            totalPatients,
            patientsByCondition: conditionCounts
        }
    }

    async getAppointmentStats(filter: AppointmentStatsFilterDto, user: User): Promise<AppointmentStatsResponseDto> {
        const matchStage: any = { deletedAt: null }
        
        if (filter.doctorId) {
            matchStage.doctorId = new Types.ObjectId(filter.doctorId)
        }
        
        if (filter.status) {
            matchStage.status = filter.status
        }

        const [totalAppointments, appointmentsByStatus, totalDoctorFees] = await Promise.all([
            this.appointmentModel.countDocuments(matchStage),
            this.appointmentModel.aggregate([
                { $match: { deletedAt: null } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            this.appointmentModel.aggregate([
                { $match: matchStage },
                { $group: { _id: null, total: { $sum: '$doctorFee' } } }
            ])
        ])

        const statusCounts = {
            [AppointmentStatus.PENDING]: 0,
            [AppointmentStatus.APPROVED]: 0,
            [AppointmentStatus.REJECTED]: 0,
            [AppointmentStatus.COMPLETED]: 0
        }

        appointmentsByStatus.forEach(item => {
            statusCounts[item._id] = item.count
        })

        return {
            totalAppointments,
            appointmentsByStatus: statusCounts,
            totalDoctorFees: totalDoctorFees[0]?.total || 0
        }
    }

    async getDoctorStats(filter: DoctorStatsFilterDto): Promise<DoctorStatsResponseDto> {
        const matchStage: any = { userType: UserType.DOCTOR, deletedAt: null }
        
        if (filter.doctorId) {
            matchStage._id = new Types.ObjectId(filter.doctorId)
        }

        const [totalDoctors, salaryStats] = await Promise.all([
            this.userModel.countDocuments(matchStage),
            this.userModel.aggregate([
                { $match: matchStage },
                { $group: { 
                    _id: null, 
                    total: { $sum: '$salary.salary' },
                    average: { $avg: '$salary.salary' }
                } }
            ])
        ])

        return {
            totalDoctors,
            totalSalaries: salaryStats[0]?.total || 0,
            averageSalary: salaryStats[0]?.average || 0
        }
    }

    async updatePatientCondition(patientId: string, healthStatus: string): Promise<void> {
        let patientCondition: PatientCondition

        // Map health status to patient condition
        if (healthStatus.toLowerCase().includes('critical')) {
            patientCondition = PatientCondition.CRITICAL
        } else if (healthStatus.toLowerCase().includes('warning')) {
            patientCondition = PatientCondition.WARNING
        } else if (healthStatus.toLowerCase().includes('normal')) {
            patientCondition = PatientCondition.NORMAL
        } else {
            patientCondition = PatientCondition.NORMAL // Default fallback
        }

        await this.userModel.findByIdAndUpdate(patientId, {
            patientCondition
        })
    }
}
