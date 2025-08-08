"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryAccountVerificationDTO = void 0;
const add_admin_dto_1 = require("./add_admin.dto");
const swagger_1 = require("@nestjs/swagger");
class RetryAccountVerificationDTO extends (0, swagger_1.PickType)(add_admin_dto_1.AddAdminDTO, ['email']) {
}
exports.RetryAccountVerificationDTO = RetryAccountVerificationDTO;
//# sourceMappingURL=retry_account_verification.dto.js.map