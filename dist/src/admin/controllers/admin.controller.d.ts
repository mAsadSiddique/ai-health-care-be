import { AdminService } from '../services/admin.service';
import { LoginDTO } from '../../shared/dto/login.dto';
import { AddAdminDTO } from '../dtos/add_admin.dto';
import { SetPasswordDTO } from '../dtos/set_password.dto';
import { ResendEmailDTO } from '../dtos/resend_email.dto';
import { AdminListingDTO } from '../dtos/admins_listing.dto';
import { Admin } from '../entities/admin.entity';
import { EditProfileDTO } from '../dtos/edit_profile.dto';
import { UpdateAdminRoleDTO } from '../dtos/update_admin_role.dto';
import { ForgotPasswordDTO } from 'src/shared/dto/forgot_password.dto';
import { ChangePasswordDTO } from 'src/shared/dto/change_password.dto';
import { ResetPasswordDTO } from '../dtos/reset_password.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    login(args: LoginDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    addAdmin(args: AddAdminDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    setPassword(args: SetPasswordDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    resendEmailForSetPassword(args: ResendEmailDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    blockAdminToggle(id: number, admin: Admin): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    viewProfile(admin: Admin): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    editProfile(args: EditProfileDTO, admin: Admin): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    updateAdminRole(args: UpdateAdminRoleDTO, admin: Admin): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    forgotPassword(args: ForgotPasswordDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    forgotPasswordUpdation(args: ResetPasswordDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    changePassword(args: ChangePasswordDTO, admin: Admin): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    adminListing(args: AdminListingDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
}
