import { Transform, Type } from 'class-transformer'
import { IsOptional, Length, IsString, IsNumber, Min, Max, IsNotEmpty, IsInt, ValidateNested, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { GenderEnum } from 'src/utils/enums/gender.enum'
import { CurrencyEnum } from 'src/utils/enums/user-type.enum'
import { IdDTO } from 'src/shared/dto/id.dto'

class UserDobDTO {
    @ApiProperty({ description: 'Day of birth', type: Number, minimum: 1, maximum: 31, example: 25 })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(31)
    day!: number

    @ApiProperty({ description: 'Month of birth', type: Number, minimum: 1, maximum: 12, example: 11 })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(12)
    month!: number

    @ApiProperty({ description: 'Year of birth', type: Number, minimum: 1900, maximum: 2100, example: 2005 })
    @IsNotEmpty()
    @IsInt()
    @Min(1950)
    @Max(new Date().getFullYear())
    year!: number
}

class DoctorSalaryDTO {
    @ApiProperty({ description: 'Salary', type: Number, example: 100000 })
    @IsNotEmpty()
    @IsNumber()
    salary!: number

    @ApiProperty({ description: 'Currency', type: String, example: 'USD' })
    @IsNotEmpty()
    @IsEnum(CurrencyEnum)
    currency!: CurrencyEnum
}

export class EditProfileDTO {
    @ApiPropertyOptional({
        description: "First name",
        nullable: true,
        example: 'John',
    })
    @IsOptional()
    @Transform(({ value }) => value.trim())
    @Length(1, 30)
    firstName: string

    @ApiPropertyOptional({
        description: "Last name",
        nullable: true,
        example: 'Doe',
    })
    @IsOptional()
    @Transform(({ value }) => value.trim())
    @Length(1, 30)
    lastName: string

    @ApiPropertyOptional({
        description: "Phone number",
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
        description: "Address",
        nullable: true,
        example: '123 Medical Center Dr, City, State',
    })
    @IsOptional()
    @IsString()
    address: string

    @ApiPropertyOptional({
        description: "Doctor's salary",
        nullable: true,
        example: {
            salary: 100000,
            currency: 'USD',
        },
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => DoctorSalaryDTO)
    salary: DoctorSalaryDTO

    @ApiPropertyOptional({
        description: 'Enter the user date of birth',
        type: UserDobDTO,
        nullable: true,
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => UserDobDTO)
    dateOfBirth!: UserDobDTO

    @ApiPropertyOptional({
        description: 'Enter the user gender',
        type: String,
        nullable: true,
    })
    @IsOptional()
    @IsEnum(GenderEnum)
    gender: GenderEnum

    @ApiPropertyOptional({
        description: 'Enter the user age',
        type: Number,
        nullable: true,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(120)
    age: number

    @ApiPropertyOptional({
        description: 'Enter the user emergency contact',
        type: String,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    emergencyContact: string
}

export class UpdatePatientDTO extends IntersectionType(IdDTO, EditProfileDTO) { }