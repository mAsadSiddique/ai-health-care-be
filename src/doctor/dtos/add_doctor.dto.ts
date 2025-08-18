import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsOptional, Length, IsString, IsNumber, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { EditProfileDTO } from './edit_profile.dto'

export class AddDoctorDTO extends EditProfileDTO {
    @ApiProperty({
        description: 'Doctor\'s email address',
        nullable: false,
        example: 'john.doe@hospital.com',
    })
    @IsNotEmpty()
    @IsEmail()
    @Transform((email) => email.value.toLowerCase())
    email: string
}

