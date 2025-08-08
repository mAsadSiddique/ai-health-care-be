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
exports.AdminListingDTO = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const utils_1 = require("../../utils/utils");
const roles_enum_1 = require("../../utils/enums/roles.enum");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../shared/dto/pagination.dto");
class AdminListingDTO extends pagination_dto_1.PaginationDTO {
}
exports.AdminListingDTO = AdminListingDTO;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search admin by id',
        nullable: true,
        example: 3,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], AdminListingDTO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search admins by role',
        nullable: true,
        example: roles_enum_1.Roles.SUPER,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(roles_enum_1.Roles),
    __metadata("design:type", String)
], AdminListingDTO.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Searching through block/unblock admins',
        nullable: true,
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (0, utils_1.toBoolean)(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminListingDTO.prototype, "isBlocked", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Search which admin's email is verified or not",
        nullable: true,
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (0, utils_1.toBoolean)(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminListingDTO.prototype, "isEmailVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Searching through email, first name last name etc...',
        nullable: true,
        example: 'waqar',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], AdminListingDTO.prototype, "search", void 0);
//# sourceMappingURL=admins_listing.dto.js.map