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
exports.RoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const exception_service_1 = require("../../shared/exception.service");
const roles_decorator_1 = require("../decorators/roles.decorator");
const shared_service_1 = require("../../shared/shared.service");
const response_messages_enum_1 = require("../../utils/enums/response_messages.enum");
let RoleGuard = class RoleGuard {
    constructor(reflector, exceptionService, sharedService) {
        this.reflector = reflector;
        this.exceptionService = exceptionService;
        this.sharedService = sharedService;
    }
    async canActivate(context) {
        try {
            const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (!requiredRoles) {
                this.exceptionService.sendUnprocessableEntityException(response_messages_enum_1.RESPONSE_MESSAGES.ROLE_REQUIRED);
            }
            const req = context.switchToHttp().getRequest();
            const admin = req.user;
            return requiredRoles.some((role) => { var _a; return (_a = admin.role) === null || _a === void 0 ? void 0 : _a.includes(role); });
        }
        catch (error) {
            console.error('error in role guard: ', error.message);
            this.sharedService.exceptionDetector(error);
            this.sharedService.sendError(error, 'RoleGuard');
        }
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        exception_service_1.ExceptionService,
        shared_service_1.SharedService])
], RoleGuard);
//# sourceMappingURL=roles-auth.guard.js.map