import { ChangePasswordDTO } from './change_password.dto';
declare const ReSetPasswordDTO_base: import("@nestjs/mapped-types").MappedType<Omit<ChangePasswordDTO, "oldPassword">>;
export declare class ReSetPasswordDTO extends ReSetPasswordDTO_base {
    jwtToken: string;
}
export {};
