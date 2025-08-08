import { AddAdminDTO } from "./add_admin.dto";
declare const EditProfileDTO_base: import("@nestjs/common").Type<Partial<Omit<AddAdminDTO, "email" | "role">>>;
export declare class EditProfileDTO extends EditProfileDTO_base {
}
export {};
