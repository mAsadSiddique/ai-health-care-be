import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class BookAppointmentDTO {
    @ApiProperty({ description: 'Doctor ID to book appointment with' })
    @IsNotEmpty()
    @IsMongoId({
        message: 'doctorId must be a valid 24-character hex MongoDB ObjectId',
    })
    doctorId: string

    @ApiProperty({ description: 'Appointment date and time (ISO string)', example: '2024-01-15T10:00:00.000Z' })
    @IsNotEmpty()
    @IsDateString()
    appointmentDateTime: string

    @ApiProperty({ description: 'Duration in minutes (15-480)', example: 60 })
    @IsNotEmpty()
    @IsNumber()
    @Min(15)
    @Max(480)
    duration: number

    @ApiProperty({ description: 'Appointment description', maxLength: 1000 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    description: string
}

