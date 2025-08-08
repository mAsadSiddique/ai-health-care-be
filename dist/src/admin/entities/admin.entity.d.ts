import { Roles } from '../../utils/enums/roles.enum';
export declare class Admin {
    id: number;
    email: string;
    password: string;
    isEmailVerified: boolean;
    firstName: string;
    lastName: string;
    twoFaAuth: string;
    isTwoFaEnable: boolean;
    isBlocked: boolean;
    role: Roles;
    createdAt: Date;
    updatedAt: Date;
    constructor(obj?: any);
}
