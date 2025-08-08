"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditProfileDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const add_admin_dto_1 = require("./add_admin.dto");
class EditProfileDTO extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(add_admin_dto_1.AddAdminDTO, ['email', 'role'])) {
}
exports.EditProfileDTO = EditProfileDTO;
//# sourceMappingURL=edit_profile.dto.js.map