import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common'
import { AdminService } from '../services/admin.service'
import { ApiBearerAuth, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from '../../utils/enums/response_messages.enum'
import { AddAdminDTO } from '../dtos/add_admin.dto'
import { AdminListingDTO } from '../dtos/admins_listing.dto'
import { Role } from '../../auth/decorators/roles.decorator'
import { Roles } from '../../utils/enums/roles.enum'
import { GuardName } from '../../auth/decorators/guards.decorator'
import { GuardsEnum } from '../../utils/enums/guards.enum'
import { CommonAuthGuard } from '../../auth/guard/common-auth.guard'
import { RoleGuard } from '../../auth/guard/roles-auth.guard'
import { user } from '../../auth/decorators/user.decorator'
import { User } from '../../user/entities/user.entity'
import { UpdateAdminRoleDTO } from '../dtos/update_admin_role.dto'
import { IdDTO } from 'src/shared/dto/id.dto'

@ApiTags('admin')
@ApiBearerAuth('JWT')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.ADMIN_REGISTERED })
    @ApiNotAcceptableResponse({ description: RESPONSE_MESSAGES.ADMIN_ALREADY_EXIST })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Post('/add')
    async addAdmin(@Body() args: AddAdminDTO) {
        return await this.adminService.addAdmin(args)
    }

    @ApiOkResponse({ description: 'admin block/unblock successfully' })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.ADMIN_NOT_FOUND })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Put('/block/toggle')
    async blockAdminToggle(@Body() { id }: IdDTO, @user() admin: User) {
        return await this.adminService.blockAdminToggle(id, admin)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.ROLE_UPDATED })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.ADMIN_NOT_FOUND })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Delete('/')
    async deleteUser(@Body() { id }: IdDTO, @user() admin: User) {
        return await this.adminService.deleteUser(id, admin)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.ROLE_UPDATED })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.ADMIN_NOT_FOUND })
    @Role(Roles.SUPER)
    @GuardName(GuardsEnum.ADMIN)
    @UseGuards(CommonAuthGuard, RoleGuard)
    @Put('/role')
    async updateAdminRole(@Body() args: UpdateAdminRoleDTO, @user() admin: User) {
        return await this.adminService.updateAdminRole(args, admin)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.ADMIN_LISTING })
    @Get('/')
    async adminListing(@Query() args: AdminListingDTO) {
        return await this.adminService.adminsListing(args)
    }
}
