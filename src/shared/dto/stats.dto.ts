import { IsOptional, IsString, IsEnum, IsMongoId } from 'class-validator'
import { PatientCondition } from '../../utils/enums/patient-condition.enum'
import { AppointmentStatus } from '../../utils/enums/appointment-status.enum'

export class PatientStatsFilterDto {
    @IsOptional()
    @IsEnum(PatientCondition)
    patientCondition?: PatientCondition
}

export class AppointmentStatsFilterDto {
    @IsOptional()
    @IsMongoId()
    doctorId?: string

    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus
}

export class DoctorStatsFilterDto {
    @IsOptional()
    @IsMongoId()
    doctorId?: string
}

export class GeneralStatsResponseDto {
    totalAdmins: number
    totalDoctors: number
    totalPatients: number
    totalAppointments: number
    totalDoctorFees: number
    totalDoctorSalaries: number
}

export class PatientStatsResponseDto {
    totalPatients: number
    patientsByCondition: {
        [key in PatientCondition]: number
    }
}

export class AppointmentStatsResponseDto {
    totalAppointments: number
    appointmentsByStatus: {
        [key in AppointmentStatus]: number
    }
    totalDoctorFees: number
}

export class DoctorStatsResponseDto {
    totalDoctors: number
    totalSalaries: number
    averageSalary: number
}
