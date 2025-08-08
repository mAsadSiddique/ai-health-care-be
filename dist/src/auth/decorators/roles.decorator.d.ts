import { Roles } from '../../utils/enums/roles.enum';
export declare const ROLES_KEY = "roles";
export declare const Role: (...roles: Roles[]) => import("@nestjs/common").CustomDecorator<string>;
