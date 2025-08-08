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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const exception_service_1 = require("../../shared/exception.service");
const shared_service_1 = require("../../shared/shared.service");
const core_1 = require("@nestjs/core");
const guards_decorator_1 = require("../decorators/guards.decorator");
const response_messages_enum_1 = require("../../utils/enums/response_messages.enum");
let CommonAuthGuard = class CommonAuthGuard {
    constructor(reflector, exceptionService, sharedService) {
        this.reflector = reflector;
        this.exceptionService = exceptionService;
        this.sharedService = sharedService;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        if (!req.headers.authorization) {
            this.exceptionService.sendUnauthorizedException(response_messages_enum_1.RESPONSE_MESSAGES.JWT_REQUIRED);
        }
        const requiredGuard = this.reflector.get(guards_decorator_1.GUARDS_KEY, context.getHandler());
        try {
            const decodedToken = this.sharedService.getDecodedToken(req.headers.authorization, context.switchToHttp().getRequest().url);
            if (decodedToken['payload']['type'] !== requiredGuard) {
                this.exceptionService.sendUnauthorizedException(response_messages_enum_1.RESPONSE_MESSAGES.JWT_INVALID);
            }
            if ((decodedToken['payload']['isForSignup'] &&
                context.switchToHttp().getRequest().url !== process.env.SET_ADMIN_PASSWORD_ROUTE_URL &&
                context.switchToHttp().getRequest().url !== process.env.RESEND_ADMIN_VERIFICATION_EMAIL_ROUTE_URL) ||
                (decodedToken['payload']['resetPassword'] &&
                    context.switchToHttp().getRequest().url !== process.env.FORGOT_ADMIN_PASSWORD_ROUTE_URL)) {
                this.exceptionService.sendUnauthorizedException(response_messages_enum_1.RESPONSE_MESSAGES.UNAUTHORIZED);
            }
            const user = await this.sharedService.getUserFromDb(requiredGuard, decodedToken['payload']['email']);
            if (!user) {
                this.exceptionService.sendUnauthorizedException(response_messages_enum_1.RESPONSE_MESSAGES.UNAUTHORIZED);
            }
            if (!user.isEmailVerified) {
                this.exceptionService.sendForbiddenException(response_messages_enum_1.RESPONSE_MESSAGES.USER_EMAIL_UNVERIFIED);
            }
            if (user.isBlocked) {
                this.exceptionService.sendUnauthorizedException(response_messages_enum_1.RESPONSE_MESSAGES.USER_BLOCKED);
            }
            req.user = user;
            return true;
        }
        catch (error) {
            console.error('error in auth guard: ', error.message);
            this.sharedService.exceptionDetector(error);
            this.sharedService.sendError(error, 'CommonAuthGuard');
        }
    }
};
exports.CommonAuthGuard = CommonAuthGuard;
exports.CommonAuthGuard = CommonAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        exception_service_1.ExceptionService,
        shared_service_1.SharedService])
], CommonAuthGuard);
//# sourceMappingURL=common-auth.guard.js.map