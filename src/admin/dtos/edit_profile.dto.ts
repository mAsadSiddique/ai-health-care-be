import { OmitType, PartialType } from "@nestjs/swagger";
import { AddAdminDTO } from "./add_admin.dto";

export class EditProfileDTO extends PartialType(OmitType(AddAdminDTO, ['email', 'role'])) { }