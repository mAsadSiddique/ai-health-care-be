import { Body, Controller, Get, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common'
import { AdminService } from '../services/admin.service'
import { ApiBearerAuth, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { LoginDTO } from '../../shared/dto/login.dto'
import { AddAdminDTO } from '../dtos/add_admin.dto'
import { SetPasswordDTO } from '../dtos/set_password.dto'
import { ResendEmailDTO } from '../dtos/resend_email.dto'
import { AdminListingDTO } from '../dtos/admins_listing.dto'
import { Role } from '../../auth/decorators/roles.decorator'
import { Roles } from '../../utils/enums/roles.enum'
import { GuardName } from '../../auth/decorators/guards.decorator'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { CommonAuthGuard } from '../../auth/guard/common-auth.guard'
import { RoleGuard } from '../../auth/guard/roles-auth.guard'
import { user } from '../../auth/decorators/user.decorator'
import { Admin } from '../entities/admin.entity'
import { EditProfileDTO } from '../dtos/edit_profile.dto'
import { UpdateAdminRoleDTO } from '../dtos/update_admin_role.dto'
import { ForgotPasswordDTO } from 'src/shared/dto/forgot_password.dto'
import { ChangePasswordDTO } from 'src/shared/dto/change_password.dto'
import { ResetPasswordDTO } from '../dtos/reset_password.dto'

@ApiTags('admin')
@ApiBearerAuth('JWT')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.SUCCESS })
    @Post('/login')
    async login(@Body() args: LoginDTO) {
        return await this.adminService.login(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.ADMIN_REGISTERED })
    @ApiNotAcceptableResponse({ description: RESPONSE_MESSAGES.ADMIN_ALREADY_EXIST })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Post('/add')
    async addAdmin(@Body() args: AddAdminDTO) {
        return await this.adminService.addAdmin(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.PASSWORD_SET })
    @ApiNotAcceptableResponse({ description: RESPONSE_MESSAGES.PASSWORD_ALREADY_SET })
    @Put('/set/password')
    async setPassword(@Body() args: SetPasswordDTO) {
        return await this.adminService.setPassword(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.EMAIL_RESEND })
    @ApiNotAcceptableResponse({ description: RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED })
    @Post('/resend/email')
    async resendEmailForSetPassword(@Body() args: ResendEmailDTO) {
        return this.adminService.resendEmail(args)
    }

    @ApiOkResponse({ description: 'admin block/unblock successfully' })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.ADMIN_NOT_FOUND })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Put('/block/toggle')
    async blockAdminToggle(@Body('id', ParseIntPipe) id: number, @user() admin: Admin) {
        return await this.adminService.blockAdminToggle(id, admin)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.SUCCESS })
    @Role(Roles.SUPER, Roles.SUB)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Get('/profile')
    async viewProfile(@user() admin: Admin) {
        return await this.adminService.getProfile(admin)
    }
    @ApiOkResponse({ description: RESPONSE_MESSAGES.ADMIN_PROFILE_UPDATED })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.ADMIN_NOT_FOUND })
    @Role(Roles.SUPER, Roles.SUB)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Put('/edit')
    async editProfile(@Body() args: EditProfileDTO, @user() admin: Admin) {
        return await this.adminService.editProfile(args, admin)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.ROLE_UPDATED })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.ADMIN_NOT_FOUND })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Put('/role')
    async updateAdminRole(@Body() args: UpdateAdminRoleDTO, @user() admin: Admin) {
        return await this.adminService.updateAdminRole(args, admin)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.FORGOT_PASSWORD_REQUEST })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.ADMIN_NOT_FOUND })
    @Post('/forgot/password')
    async forgotPassword(@Body() args: ForgotPasswordDTO) {
        return await this.adminService.forgotPassword(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.JWT_INVALID })
    @Put('/reset/password')
    async forgotPasswordUpdation(@Body() args: ResetPasswordDTO) {
        return await this.adminService.resetPassword(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY })
    @ApiNotAcceptableResponse({ description: RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED })
    @Role(Roles.SUPER, Roles.SUB)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Put('/change/password')
    async changePassword(@Body() args: ChangePasswordDTO, @user() admin: Admin) {
        return await this.adminService.changePassword(args, admin)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.ADMIN_LISTING })
    @Get('/')
    async adminListing(@Query() args: AdminListingDTO) {
        return await this.adminService.adminsListing(args)
    }
}
