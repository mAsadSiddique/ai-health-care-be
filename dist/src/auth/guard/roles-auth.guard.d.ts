import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExceptionService } from '../../shared/exception.service';
import { SharedService } from '../../shared/shared.service';
export declare class RoleGuard implements CanActivate {
    private reflector;
    private readonly exceptionService;
    private readonly sharedService;
    constructor(reflector: Reflector, exceptionService: ExceptionService, sharedService: SharedService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
