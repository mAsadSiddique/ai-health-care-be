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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const exception_service_1 = require("../../shared/exception.service");
const typeorm_2 = require("typeorm");
const shared_service_1 = require("../../shared/shared.service");
const response_messages_enum_1 = require("../../utils/enums/response_messages.enum");
const admin_entity_1 = require("../entities/admin.entity");
const guards_enum_1 = require("../../utils/enums/guards.enum");
const class_validator_1 = require("class-validator");
const cache_manager_1 = require("@nestjs/cache-manager");
const randomString = require("randomstring");
let AdminService = AdminService_1 = class AdminService {
    constructor(accountVerificationCache, adminRepo, exceptionService, sharedService) {
        this.accountVerificationCache = accountVerificationCache;
        this.adminRepo = adminRepo;
        this.exceptionService = exceptionService;
        this.sharedService = sharedService;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async login(args) {
        try {
            const adminInDB = await this.adminRepo.findOneBy({ email: args.email });
            if (!adminInDB) {
                this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND);
            }
            if (adminInDB.isBlocked) {
                this.exceptionService.sendForbiddenException(response_messages_enum_1.RESPONSE_MESSAGES.USER_BLOCKED);
            }
            if (!adminInDB.isEmailVerified) {
                this.exceptionService.sendUnprocessableEntityException(response_messages_enum_1.RESPONSE_MESSAGES.USER_EMAIL_UNVERIFIED);
            }
            this.sharedService.bcryptCompareVerificatoin(args.password, adminInDB.password);
            const data = {};
            let payload = this.getPayload(adminInDB);
            const jwtToken = this.sharedService.getJwt(payload);
            data['jwtToken'] = jwtToken;
            payload = this.getProfileData(adminInDB);
            data['admin'] = payload;
            return this.sharedService.sendResponse(response_messages_enum_1.RESPONSE_MESSAGES.LOGGED_IN, data);
        }
        catch (error) {
            this.sharedService.sendError(error, this.login.name);
        }
    }
    async addAdmin(args) {
        try {
            const adminInDb = await this.adminRepo.findOneBy({ email: args.email });
            if (adminInDb) {
                this.exceptionService.sendForbiddenException(response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_ALREADY_EXIST);
            }
            const admin = new admin_entity_1.Admin(args);
            admin['password'] = process.env.DEFAULT_PASSWORD;
            await this.adminRepo.insert(admin);
            const msg = await this.sendSetPasswordCode(args, admin);
            this.logger.log(`Set password code sent successfully for user ${admin.id}`, this.addAdmin.name);
            return this.sharedService.sendResponse(msg);
        }
        catch (error) {
            this.sharedService.sendError(error, this.addAdmin.name);
        }
    }
    async sendSetPasswordCode(args, user) {
        try {
            let msg;
            const code = randomString.generate({ length: 6, charset: 'numeric' });
            this.logger.debug(`Set Password code generated for admin : ${args.email}`);
            if (args.email) {
                if (user.isEmailVerified) {
                    this.logger.warn(`Admin email already verified: ${user.id}`);
                    this.exceptionService.sendNotAcceptableException(response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_EMAIL_ALREADY_VERIFIED);
                }
                if (await this.accountVerificationCache.get(`setPassword${args.email}`)) {
                    this.exceptionService.sendForbiddenException(response_messages_enum_1.RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN);
                }
                await this.accountVerificationCache.set(`setPassword${args.email}`, '123456', 300000);
                msg = response_messages_enum_1.RESPONSE_MESSAGES.EMAIL_VERIFICATION_CODE_SENT;
            }
            else {
            }
            return msg;
        }
        catch (error) {
            this.sharedService.sendError(error, this.sendSetPasswordCode.name);
        }
    }
    async resendEmail(args) {
        try {
            const admin = await this.adminRepo.findOneBy({ email: args.email });
            if (!admin)
                this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND);
            const msg = await this.sendSetPasswordCode(args, admin);
            this.logger.log(`Verification code sent successfully for user ${admin.id}`, this.addAdmin.name);
            return this.sharedService.sendResponse(msg);
        }
        catch (error) {
            this.sharedService.sendError(error, this.resendEmail.name);
        }
    }
    async setPassword(args, admin) {
        try {
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword);
            if (args.email)
                await this.verifyAccountCode(`setPassword${args.email}`, args.code);
            admin = await this.adminRepo.findOneBy({ email: args.email });
            if (admin.password !== process.env.DEFAULT_PASSWORD) {
                this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.PASSWORD_ALREADY_SET);
            }
            admin.password = this.sharedService.hashedPassword(args.password);
            admin.isEmailVerified = true;
            await this.adminRepo.update(admin.id, { password: admin.password, isEmailVerified: admin.isEmailVerified });
            return this.sharedService.sendResponse(response_messages_enum_1.RESPONSE_MESSAGES.PASSWORD_SET);
        }
        catch (error) {
            this.sharedService.sendError(error, this.setPassword.name);
        }
    }
    async verifyAccountCode(key, verificationCode) {
        try {
            const code = await this.accountVerificationCache.get(key);
            if (!code)
                this.exceptionService.sendForbiddenException(response_messages_enum_1.RESPONSE_MESSAGES.CODE_EXPIRED);
            if (verificationCode !== code)
                this.exceptionService.sendNotAcceptableException(response_messages_enum_1.RESPONSE_MESSAGES.INVALID_CODE);
            await this.accountVerificationCache.del(key);
            return code;
        }
        catch (error) {
            this.sharedService.sendError(error, this.verifyAccountCode.name);
        }
    }
    async forgotPassword(args) {
        try {
            this.logger.log(`Forgot password request for: ${args.email}`, this.forgotPassword.name);
            const admin = await this.adminRepo.findOne({
                where: {
                    email: args.email,
                },
            });
            if (!admin) {
                this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND);
            }
            if (!admin.isEmailVerified) {
                this.exceptionService.sendForbiddenException(response_messages_enum_1.RESPONSE_MESSAGES.EMAIL_UNVERIFIED);
            }
            const msg = await this.sendForgotPasswordCode(args);
            return this.sharedService.sendResponse(msg);
        }
        catch (error) {
            this.sharedService.sendError(error, this.forgotPassword.name);
        }
    }
    async sendForgotPasswordCode(args) {
        try {
            let msg;
            const code = randomString.generate({ length: 6, charset: 'numeric' });
            this.logger.debug(`Reset password code generated for admin : ${args.email}`);
            if (args.email) {
                if (await this.accountVerificationCache.get(`resetPassword${args.email}`)) {
                    this.exceptionService.sendForbiddenException(response_messages_enum_1.RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN);
                }
                await this.accountVerificationCache.set(`resetPassword${args.email}`, '123456', 300000);
                msg = response_messages_enum_1.RESPONSE_MESSAGES.EMAIL_RESET_CODE_SENT;
            }
            else {
            }
            return msg;
        }
        catch (error) {
            this.sharedService.sendError(error, this.sendForgotPasswordCode.name);
        }
    }
    async resetPassword(args) {
        try {
            this.logger.log('Processing password reset request');
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword);
            const admin = await this.adminRepo.findOne({
                where: {
                    email: args.email,
                },
            });
            if (!admin) {
                this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND);
            }
            await this.verifyAccountCode(`resetPassword${args.email}`, args.code);
            this.logger.debug('Email verification code to reset password validated successfully', this.resetPassword.name);
            admin.password = this.sharedService.hashedPassword(args.password);
            await this.adminRepo.update(admin.id, { password: admin.password });
            return this.sharedService.sendResponse(response_messages_enum_1.RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY);
        }
        catch (error) {
            this.sharedService.sendError(error, this.resetPassword.name);
        }
    }
    async changePassword(args, admin) {
        try {
            if (args.password === args.oldPassword) {
                this.exceptionService.sendNotAcceptableException(response_messages_enum_1.RESPONSE_MESSAGES.PASS_CANT_SAME);
            }
            this.sharedService.bcryptCompareVerificatoin(args.oldPassword, admin.password);
            this.sharedService.passwordsVerificatoin(args.password, args.confirmPassword);
            const hashedPass = this.sharedService.hashedPassword(args.password);
            admin.password = hashedPass;
            await this.adminRepo.update(admin.id, { password: admin.password });
            return this.sharedService.sendResponse(response_messages_enum_1.RESPONSE_MESSAGES.PASS_CHANGED_SUCCESSFULLY);
        }
        catch (error) {
            this.sharedService.sendError(error, this.changePassword.name);
        }
    }
    async blockAdminToggle(id, admin) {
        try {
            if (!(0, class_validator_1.isPositive)(id)) {
                this.exceptionService.sendUnprocessableEntityException(response_messages_enum_1.RESPONSE_MESSAGES.ID_MUST_BE_POSITIVE_NUMMER);
            }
            if (id === admin.id) {
                this.exceptionService.sendUnprocessableEntityException(response_messages_enum_1.RESPONSE_MESSAGES.SELF_BLOCKING_NOT_ALLOWED);
            }
            const adminInDB = await this.adminRepo.findOne({
                where: { id },
            });
            if (!adminInDB) {
                this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND);
            }
            await this.adminRepo.update(id, { isBlocked: !adminInDB.isBlocked });
            const msg = adminInDB.isBlocked ? response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_UNBLOCKED : response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_BLOCKED;
            return this.sharedService.sendResponse(msg);
        }
        catch (error) {
            this.sharedService.sendError(error, this.blockAdminToggle.name);
        }
    }
    async getProfile(admin) {
        try {
            const data = this.getProfileData(admin);
            return this.sharedService.sendResponse(response_messages_enum_1.RESPONSE_MESSAGES.SUCCESS, data);
        }
        catch (error) {
            this.sharedService.sendError(error, this.getProfile.name);
        }
    }
    async editProfile(args, admin) {
        try {
            Object.assign(admin, args);
            await this.adminRepo.update({ id: admin.id }, admin);
            const data = await this.getProfile(admin);
            return this.sharedService.sendResponse(response_messages_enum_1.RESPONSE_MESSAGES.PROFILE_UPDATED, data);
        }
        catch (error) {
            this.sharedService.sendError(error, this.getProfile.name);
        }
    }
    async updateAdminRole(args, admin) {
        try {
            if (args.id === admin.id) {
                this.exceptionService.sendUnprocessableEntityException(response_messages_enum_1.RESPONSE_MESSAGES.SELF_UPDATION_NOT_ALLOWED);
            }
            const adminMember = await this.adminRepo.findOne({
                where: { id: args.id }
            });
            if (!adminMember) {
                this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_NOT_FOUND);
            }
            adminMember.role = args.role;
            await this.adminRepo.update({ id: adminMember.id }, { role: adminMember.role });
            return this.sharedService.sendResponse(response_messages_enum_1.RESPONSE_MESSAGES.ROLE_UPDATED, { admin: adminMember });
        }
        catch (error) {
            this.sharedService.sendError(error, this.updateAdminRole.name);
        }
    }
    async adminsListing(args) {
        try {
            let whereClause = {};
            if (args.hasOwnProperty('isBlocked') && args.isBlocked !== undefined) {
                whereClause['isBlocked'] = args.isBlocked;
            }
            if (args.hasOwnProperty('isEmailVerified') && args.isEmailVerified !== undefined) {
                whereClause['isEmailVerified'] = args.isEmailVerified;
            }
            if (args.id) {
                whereClause['id'] = args.id;
            }
            if (args.role) {
                whereClause['role'] = args.role;
            }
            if (args.search) {
                whereClause = [
                    Object.assign(Object.assign({}, whereClause), { firstName: (0, typeorm_2.ILike)(`%${args.search}%`) }),
                    Object.assign(Object.assign({}, whereClause), { lastName: (0, typeorm_2.ILike)(`%${args.search}%`) }),
                    Object.assign(Object.assign({}, whereClause), { email: (0, typeorm_2.ILike)(`%${args.search}%`) })
                ];
            }
            const [admins, count] = await this.adminRepo.findAndCount({
                where: whereClause,
                skip: args.pageNumber * args.pageSize,
                take: args.pageSize,
                order: { 'id': 'DESC' }
            });
            return this.sharedService.sendResponse(response_messages_enum_1.RESPONSE_MESSAGES.ADMIN_LISTING, { count, admins });
        }
        catch (error) {
            this.sharedService.sendError(error, this.adminsListing.name);
        }
    }
    getProfileData(admin) {
        try {
            return {
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                role: admin.role,
            };
        }
        catch (error) {
            this.sharedService.sendError(error, this.getProfileData.name);
        }
    }
    getPayload(admin) {
        return {
            email: admin.email,
            firstName: admin.firstName,
            role: admin.role,
            type: guards_enum_1.GuardsEnum.ADMIN,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(1, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __metadata("design:paramtypes", [Object, typeorm_2.Repository,
        exception_service_1.ExceptionService,
        shared_service_1.SharedService])
], AdminService);
//# sourceMappingURL=admin.service.js.map