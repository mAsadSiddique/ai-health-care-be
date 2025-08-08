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
exports.SetPasswordDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class SetPasswordDTO {
}
exports.SetPasswordDTO = SetPasswordDTO;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Admin's email",
        nullable: false,
        example: 'waqar@gmail.com',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_transformer_1.Transform)((email) => email.value.toLowerCase()),
    __metadata("design:type", String)
], SetPasswordDTO.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Provide code for email/phone number verification',
        nullable: false,
        example: "326543",
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], SetPasswordDTO.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Admin's password",
        nullable: false,
        example: 'Waqar.123!',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,30})$/, {
        message: 'password must contain atleast 8 letters, 1 upper case, lower case, number and special character',
    }),
    __metadata("design:type", String)
], SetPasswordDTO.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Admin's confirm password ",
        nullable: false,
        example: 'Waqar.123!',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,30})$/, {
        message: 'confirmPassword must contain atleast 8 letters, 1 upper case, lower case, number and special character',
    }),
    __metadata("design:type", String)
], SetPasswordDTO.prototype, "confirmPassword", void 0);
//# sourceMappingURL=set_password.dto.js.map