import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { AppointmentStatus } from '../../utils/enums/appointment-status.enum'
import { IdDTO } from 'src/shared/dto/id.dto'

export class UpdateAppointmentStatusDTO extends IdDTO {
    @ApiProperty({ description: 'New appointment status', enum: AppointmentStatus })
    @IsNotEmpty()
    @IsEnum(AppointmentStatus)
    status: AppointmentStatus

    @ApiProperty({ description: 'Reason for rejection (required if status is rejected)', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    rejectionReason?: string
}
