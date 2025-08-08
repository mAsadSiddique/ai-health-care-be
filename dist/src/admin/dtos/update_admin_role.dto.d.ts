import { AddAdminDTO } from './add_admin.dto';
declare const UpdateAdminRoleDTO_base: import("@nestjs/common").Type<Pick<AddAdminDTO, "role">>;
export declare class UpdateAdminRoleDTO extends UpdateAdminRoleDTO_base {
    id: number;
}
export {};
