import { Transform } from 'class-transformer'
import { IsOptional, Length, IsString, IsNumber, Min, Max } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class EditProfileDTO {
    @ApiPropertyOptional({
        description: "Doctor's first name",
        nullable: true,
        example: 'John',
    })
    @IsOptional()
    @Transform(({ value }) => value.trim())
    @Length(1, 30)
    firstName: string

    @ApiPropertyOptional({
        description: "Doctor's last name",
        nullable: true,
        example: 'Doe',
    })
    @IsOptional()
    @Transform(({ value }) => value.trim())
    @Length(1, 30)
    lastName: string

    @ApiPropertyOptional({
        description: "Doctor's phone number",
        nullable: true,
        example: '+1234567890',
    })
    @IsOptional()
    @IsString()
    phoneNumber: string

    @ApiPropertyOptional({
        description: "Doctor's specialization",
        nullable: true,
        example: 'Cardiology',
    })
    @IsOptional()
    @IsString()
    specialization: string

    @ApiPropertyOptional({
        description: "Doctor's license number",
        nullable: true,
        example: 'MD123456',
    })
    @IsOptional()
    @IsString()
    licenseNumber: string

    @ApiPropertyOptional({
        description: "Doctor's years of experience",
        nullable: true,
        example: 10,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(50)
    experience: number

    @ApiPropertyOptional({
        description: "Doctor's qualification",
        nullable: true,
        example: 'MBBS, MD',
    })
    @IsOptional()
    @IsString()
    qualification: string

    @ApiPropertyOptional({
        description: "Doctor's address",
        nullable: true,
        example: '123 Medical Center Dr, City, State',
    })
    @IsOptional()
    @IsString()
    address: string
}
