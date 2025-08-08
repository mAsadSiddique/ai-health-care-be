import { ExceptionService } from '../../shared/exception.service';
import { Repository } from 'typeorm';
import { LoginDTO } from '../../shared/dto/login.dto';
import { SharedService } from '../../shared/shared.service';
import { AddAdminDTO } from '../dtos/add_admin.dto';
import { Admin } from '../entities/admin.entity';
import { SetPasswordDTO } from '../dtos/set_password.dto';
import { ResendEmailDTO } from '../dtos/resend_email.dto';
import { AdminListingDTO } from '../dtos/admins_listing.dto';
import { EditProfileDTO } from '../dtos/edit_profile.dto';
import { UpdateAdminRoleDTO } from '../dtos/update_admin_role.dto';
import { ForgotPasswordDTO } from 'src/shared/dto/forgot_password.dto';
import { ChangePasswordDTO } from 'src/shared/dto/change_password.dto';
import { RetryAccountVerificationDTO } from '../dtos/retry_account_verification.dto';
import { ResetPasswordDTO } from '../dtos/reset_password.dto';
export declare class AdminService {
    private accountVerificationCache;
    private readonly adminRepo;
    private readonly exceptionService;
    private readonly sharedService;
    private readonly logger;
    constructor(accountVerificationCache: any, adminRepo: Repository<Admin>, exceptionService: ExceptionService, sharedService: SharedService);
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
    sendSetPasswordCode(args: RetryAccountVerificationDTO, user: Admin): Promise<string>;
    resendEmail(args: ResendEmailDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    setPassword(args: SetPasswordDTO, admin?: Admin): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    private verifyAccountCode;
    forgotPassword(args: ForgotPasswordDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    private sendForgotPasswordCode;
    resetPassword(args: ResetPasswordDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    changePassword(args: ChangePasswordDTO, admin: Admin): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    blockAdminToggle(id: number, admin: Admin): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    getProfile(admin: Admin): Promise<{
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
    adminsListing(args: AdminListingDTO): Promise<{
        message: string;
        data: any;
        status: number;
    }>;
    private getProfileData;
    private getPayload;
}
