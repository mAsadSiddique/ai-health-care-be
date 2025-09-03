import { Body, Controller, Post, Put, UseGuards, Get, Req, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RESPONSE_MESSAGES } from '../utils/enums/response_messages.enum'
import { UserService } from './user.service'
import { ChangePasswordDTO } from '../shared/dto/change_password.dto'
import { CommonAuthGuard } from '../auth/guard/common-auth.guard'
import { user } from '../auth/decorators/user.decorator'
import { User } from './entities/user.entity'
import { LoginDTO } from 'src/shared/dto/login.dto'
import { ForgotPasswordDTO } from 'src/shared/dto/forgot_password.dto'
import { ResetPasswordDTO } from 'src/admin/dtos/reset_password.dto'
import { EditProfileDTO } from 'src/doctor/dtos/edit_profile.dto'

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.LOGGED_IN })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.USER_NOT_FOUND })
    @Post('/login')
    async login(@Body() args: LoginDTO) {
        return await this.userService.login(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.FORGOT_PASSWORD_REQUEST })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.USER_NOT_FOUND })
    @Post('/forgot/password')
    async forgotPassword(@Body() args: ForgotPasswordDTO) {
        return await this.userService.forgotPassword(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.JWT_INVALID })
    @Put('/reset/password')
    async resetPassword(@Body() args: ResetPasswordDTO) {
        return await this.userService.resetPassword(args)
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.SUCCESS })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.USER_NOT_FOUND })
    @ApiBearerAuth('JWT')
    @UseGuards(CommonAuthGuard)
    @Get('/profile')
    async getProfile(@user() user: User) {
        return await this.userService.getProfile(user._id.toString())
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.PROFILE_UPDATED })
    @ApiNotFoundResponse({ description: RESPONSE_MESSAGES.USER_NOT_FOUND })
    @ApiBearerAuth('JWT')
    @UseGuards(CommonAuthGuard)
    @Put('/edit')
    async editProfile(@Body() args: EditProfileDTO, @user() user: User) {
        return await this.userService.editProfile(args, user._id.toString())
    }

    @ApiOkResponse({ description: RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY })
    @ApiNotAcceptableResponse({ description: RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED })
    @ApiBearerAuth('JWT')
    @UseGuards(CommonAuthGuard)
    @Put('/change/password')
    async changePassword(@Body() args: ChangePasswordDTO, @user() user: User) {
        return await this.userService.changePassword(args, user._id.toString())
    }
}
