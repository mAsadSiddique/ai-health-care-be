import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { DoctorsListingDTO } from "src/doctor/dtos/doctors_listing.dto";
import { UserType } from "src/utils/enums/user-type.enum";

export class UserListingDTO extends DoctorsListingDTO {
    @ApiPropertyOptional({
        description: 'Filter by user type',
        enum: UserType,
        example: UserType.DOCTOR
    })
    @IsOptional()
    @IsEnum(UserType)
    userType: UserType
}