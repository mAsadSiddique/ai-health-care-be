"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionService = void 0;
const common_1 = require("@nestjs/common");
let ExceptionService = class ExceptionService {
    sendNotAcceptableException(message) {
        throw new common_1.NotAcceptableException(message);
    }
    sendNotFoundException(message) {
        throw new common_1.NotFoundException(message);
    }
    sendInternalServerErrorException(message) {
        throw new common_1.InternalServerErrorException(message);
    }
    sendConflictException(message) {
        throw new common_1.ConflictException(message);
    }
    sendUnprocessableEntityException(message) {
        throw new common_1.UnprocessableEntityException(message);
    }
    sendBadRequestException(message) {
        throw new common_1.BadRequestException(message);
    }
    sendForbiddenException(message) {
        throw new common_1.ForbiddenException(message);
    }
    sendUnauthorizedException(message) {
        throw new common_1.UnauthorizedException(message);
    }
};
exports.ExceptionService = ExceptionService;
exports.ExceptionService = ExceptionService = __decorate([
    (0, common_1.Injectable)()
], ExceptionService);
//# sourceMappingURL=exception.service.js.map