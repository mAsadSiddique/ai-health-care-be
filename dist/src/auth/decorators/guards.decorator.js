"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardName = exports.GUARDS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.GUARDS_KEY = 'guards';
const GuardName = (guardName) => (0, common_1.SetMetadata)(exports.GUARDS_KEY, guardName);
exports.GuardName = GuardName;
//# sourceMappingURL=guards.decorator.js.map