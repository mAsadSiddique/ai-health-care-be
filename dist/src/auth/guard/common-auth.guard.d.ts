import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ExceptionService } from '../../shared/exception.service';
import { SharedService } from '../../shared/shared.service';
import { Reflector } from '@nestjs/core';
export declare class CommonAuthGuard implements CanActivate {
    private reflector;
    private readonly exceptionService;
    private readonly sharedService;
    constructor(reflector: Reflector, exceptionService: ExceptionService, sharedService: SharedService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
