import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharedModule } from './../shared/shared.module'
import { CommonAuthGuard } from './guard/common-auth.guard'

@Module({
	imports: [TypeOrmModule.forFeature(), forwardRef(() => SharedModule)],
	providers: [CommonAuthGuard],
	exports: [CommonAuthGuard, TypeOrmModule],
})
export class AuthModule {}
