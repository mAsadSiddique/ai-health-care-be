import { Roles } from '../../utils/enums/roles.enum';
import { PaginationDTO } from '../../shared/dto/pagination.dto';
export declare class AdminListingDTO extends PaginationDTO {
    id: number;
    role: Roles;
    isBlocked: boolean;
    isEmailVerified: boolean;
    search: string;
}
