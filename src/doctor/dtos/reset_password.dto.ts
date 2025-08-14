import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ResetPasswordDTO {
    @ApiProperty({
        description: 'Doctor\'s email address',
        nullable: false,
        example: 'john.doe@hospital.com',
    })
    @IsNotEmpty()
    @IsEmail()
    @Transform((email) => email.value.toLowerCase())
    email: string

    @ApiProperty({
        description: 'Verification code sent to email',
        nullable: false,
        example: '123456',
    })
    @IsNotEmpty()
    @Length(6, 6)
    code: string

    @ApiProperty({
        description: 'New password',
        nullable: false,
        example: 'Waqar.123!',
    })
    @IsNotEmpty()
    @Matches(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,30})$/, {
        message: 'password must contain atleast 8 letters, 1 upper case, lower case, number and special character',
    })
    password: string

    @ApiProperty({
        description: 'Confirm password',
        nullable: false,
        example: 'Waqar.123!',
    })
    @IsNotEmpty()
    @Matches(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,30})$/, {
        message: 'confirmPassword must contain atleast 8 letters, 1 upper case, lower case, number and special character',
    })
    confirmPassword: string
}
