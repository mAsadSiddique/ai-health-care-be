import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RetryAccountVerificationDTO {
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

