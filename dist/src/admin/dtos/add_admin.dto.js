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
exports.AddAdminDTO = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const roles_enum_1 = require("../../utils/enums/roles.enum");
class AddAdminDTO {
}
exports.AddAdminDTO = AddAdminDTO;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "user's first name",
        nullable: true,
        example: 'waqar',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    (0, class_validator_1.Length)(1, 30),
    __metadata("design:type", String)
], AddAdminDTO.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "user's last name",
        nullable: true,
        example: 'hussain',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    (0, class_validator_1.Length)(1, 30),
    __metadata("design:type", String)
], AddAdminDTO.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'user’s email address',
        nullable: false,
        example: 'waqar@gmail.com',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_transformer_1.Transform)((email) => email.value.toLowerCase()),
    __metadata("design:type", String)
], AddAdminDTO.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Admin's role",
        nullable: true,
        example: roles_enum_1.Roles.SUPER,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(roles_enum_1.Roles),
    __metadata("design:type", String)
], AddAdminDTO.prototype, "role", void 0);
//# sourceMappingURL=add_admin.dto.js.map