import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'
import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger'
import { AppointmentStatus } from '../../utils/enums/appointment-status.enum'
import { PaginationDTO } from '../../shared/dto/pagination.dto'
import { IdDTO } from 'src/shared/dto/id.dto'

export class AppointmentsListingDTO extends IntersectionType(PartialType(IdDTO), PaginationDTO) {
    @ApiProperty({ description: 'Filter by appointment status', enum: AppointmentStatus, required: false })
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus

    @ApiProperty({ description: 'Filter by date (YYYY-MM-DD)', required: false })
    @IsOptional()
    @IsString()
    date?: string

    @ApiProperty({ description: 'Search by patient name or email', required: false })
    @IsOptional()
    @IsString()
    search?: string
}


export class DoctorAppointmentsListingDTO extends AppointmentsListingDTO {
    @ApiProperty({ description: 'Filter by doctor ID', required: false })
    @IsOptional()
    @IsMongoId({
        message: 'doctorId must be a valid 24-character hex MongoDB ObjectId',
    })
    doctorId?: string

    @ApiProperty({ description: 'Filter by patient ID', required: false })
    @IsOptional()
    @IsMongoId({
        message: 'patientId must be a valid 24-character hex MongoDB ObjectId',
    })
    patientId?: string
}
