import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from '../utils/enums/response_messages.enum'
import { Role } from '../auth/decorators/roles.decorator'
import { Roles } from '../utils/enums/roles.enum'
import { GuardName } from '../auth/decorators/guards.decorator'
import { GuardsEnum } from '../utils/enums/guards.enum'
import { CommonAuthGuard } from '../auth/guard/common-auth.guard'
import { RoleGuard } from '../auth/guard/roles-auth.guard'
import { UserService } from 'src/user/user.service'
import { UserListingDTO } from './dtos/user-listing.dto'
import { UserTypeGuard } from 'src/auth/decorators/user-type.decorator'
import { UserType } from 'src/utils/enums/user-type.enum'

@ApiTags('admin-user')
@ApiBearerAuth('JWT')
@Controller('admin/user')
export class AdminUserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.USER_LISTING })
    // @Role(Roles.SUPER, Roles.SUB)
    // @GuardName(GuardsEnum.ADMIN)
    // @UseGuards(CommonAuthGuard, RoleGuard)
    @UserTypeGuard(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
    @Get('/')
    async userListing(@Query() args: UserListingDTO) {
        return await this.userService.userListing(args)
    }
}
