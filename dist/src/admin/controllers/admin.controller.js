"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("../services/admin.service");
const swagger_1 = require("@nestjs/swagger");
const response_messages_enum_1 = require("../../utils/enums/response_messages.enum");
const login_dto_1 = require("../../shared/dto/login.dto");
const add_admin_dto_1 = require("../dtos/add_admin.dto");
const set_password_dto_1 = require("../dtos/set_password.dto");
const resend_email_dto_1 = require("../dtos/resend_email.dto");
const admins_listing_dto_1 = require("../dtos/admins_listing.dto");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const roles_enum_1 = require("../../utils/enums/roles.enum");
const guards_decorator_1 = require("../../auth/decorators/guards.decorator");
const guards_enum_1 = require("../../utils/enums/guards.enum");
const common_auth_guard_1 = require("../../auth/guard/common-auth.guard");
const roles_auth_guard_1 = require("../../auth/guard/roles-auth.guard");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const admin_entity_1 = require("../entities/admin.entity");
const edit_profile_dto_1 = require("../dtos/edit_profile.dto");
const update_admin_role_dto_1 = require("../dtos/update_admin_role.dto");
const forgot_password_dto_1 = require("../../shared/dto/forgot_password.dto");
const change_password_dto_1 = require("../../shared/dto/change_password.dto");
const reset_password_dto_1 = require("../dtos/reset_password.dto");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async login(args) {
        return await this.adminService.login(args);
    }
    async addAdmin(args) {
        return await this.adminService.addAdmin(args);
    }
    async setPassword(args) {
        return await this.adminService.setPassword(args);
    }
    async resendEmailForSetPassword(args) {
        return this.adminService.resendEmail(args);
    }
    async blockAdminToggle(id, admin) {
        return await this.adminService.blockAdminToggle(id, admin);
    }
    async viewProfile(admin) {
        return await this.adminService.getProfile(admin);
    }
    async editProfile(args, admin) {
        return await this.adminService.editProfile(args, admin);
    }
    async updateAdminRole(args, admin) {
        return await this.adminService.updateAdminRole(args, admin);
    }
    async forgotPassword(args) {
        return await this.adminService.forgotPassword(args);
    }
    async forgotPasswordUpdation(args) {
        return await this.adminService.resetPassword(args);
    }
    async changePassword(args, admin) {
        return await this.adminService.changePassword(args, admin);
    }
    async adminListing(args) {
        return await this.adminService.adminsListing(args);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.SUCCESS }),
    (0, common_1.Post)('/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDTO]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_REGISTERED }),
    (0, swagger_1.ApiNotAcceptableResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_ALREADY_EXIST }),
    (0, roles_decorator_1.Role)(roles_enum_1.Roles.SUPER),
    (0, guards_decorator_1.GuardName)(guards_enum_1.GuardsEnum.ADMIN),
    (0, common_1.UseGuards)(common_auth_guard_1.CommonAuthGuard, roles_auth_guard_1.RoleGuard),
    (0, common_1.Post)('/add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_admin_dto_1.AddAdminDTO]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addAdmin", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.PASSWORD_SET }),
    (0, swagger_1.ApiNotAcceptableResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.PASSWORD_ALREADY_SET }),
    (0, common_1.Put)('/set/password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [set_password_dto_1.SetPasswordDTO]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setPassword", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.EMAIL_RESEND }),
    (0, swagger_1.ApiNotAcceptableResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED }),
    (0, common_1.Post)('/resend/email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_email_dto_1.ResendEmailDTO]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "resendEmailForSetPassword", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: 'admin block/unblock successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND }),
    (0, roles_decorator_1.Role)(roles_enum_1.Roles.SUPER),
    (0, guards_decorator_1.GuardName)(guards_enum_1.GuardsEnum.ADMIN),
    (0, common_1.UseGuards)(common_auth_guard_1.CommonAuthGuard, roles_auth_guard_1.RoleGuard),
    (0, common_1.Put)('/block/toggle'),
    __param(0, (0, common_1.Body)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.user)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, admin_entity_1.Admin]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "blockAdminToggle", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.SUCCESS }),
    (0, roles_decorator_1.Role)(roles_enum_1.Roles.SUPER, roles_enum_1.Roles.SUB),
    (0, guards_decorator_1.GuardName)(guards_enum_1.GuardsEnum.ADMIN),
    (0, common_1.UseGuards)(common_auth_guard_1.CommonAuthGuard, roles_auth_guard_1.RoleGuard),
    (0, common_1.Get)('/profile'),
    __param(0, (0, user_decorator_1.user)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_entity_1.Admin]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "viewProfile", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_PROFILE_UPDATED }),
    (0, swagger_1.ApiNotFoundResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND }),
    (0, roles_decorator_1.Role)(roles_enum_1.Roles.SUPER, roles_enum_1.Roles.SUB),
    (0, guards_decorator_1.GuardName)(guards_enum_1.GuardsEnum.ADMIN),
    (0, common_1.UseGuards)(common_auth_guard_1.CommonAuthGuard, roles_auth_guard_1.RoleGuard),
    (0, common_1.Put)('/edit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.user)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [edit_profile_dto_1.EditProfileDTO, admin_entity_1.Admin]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "editProfile", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.ROLE_UPDATED }),
    (0, swagger_1.ApiNotFoundResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND }),
    (0, roles_decorator_1.Role)(roles_enum_1.Roles.SUPER),
    (0, guards_decorator_1.GuardName)(guards_enum_1.GuardsEnum.ADMIN),
    (0, common_1.UseGuards)(common_auth_guard_1.CommonAuthGuard, roles_auth_guard_1.RoleGuard),
    (0, common_1.Put)('/role'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.user)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_admin_role_dto_1.UpdateAdminRoleDTO, admin_entity_1.Admin]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAdminRole", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.FORGOT_PASSWORD_REQUEST }),
    (0, swagger_1.ApiNotFoundResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND }),
    (0, common_1.Post)('/forgot/password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDTO]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "forgotPassword", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY }),
    (0, swagger_1.ApiNotFoundResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.JWT_INVALID }),
    (0, common_1.Put)('/reset/password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDTO]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "forgotPasswordUpdation", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY }),
    (0, swagger_1.ApiNotAcceptableResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED }),
    (0, roles_decorator_1.Role)(roles_enum_1.Roles.SUPER, roles_enum_1.Roles.SUB),
    (0, guards_decorator_1.GuardName)(guards_enum_1.GuardsEnum.ADMIN),
    (0, common_1.UseGuards)(common_auth_guard_1.CommonAuthGuard, roles_auth_guard_1.RoleGuard),
    (0, common_1.Put)('/change/password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.user)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordDTO, admin_entity_1.Admin]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changePassword", null);
__decorate([
    (0, swagger_1.ApiOkResponse)({ description: response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_LISTING }),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admins_listing_dto_1.AdminListingDTO]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "adminListing", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map