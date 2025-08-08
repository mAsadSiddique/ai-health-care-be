import { Module } from '@nestjs/common'
import { AdminController } from './controllers/admin.controller'
import { AdminService } from './services/admin.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Admin } from './entities/admin.entity'
import { SharedModule } from '../shared/shared.module'
import { AuthModule } from '../auth/auth.module'

@Module({
	imports: [TypeOrmModule.forFeature([Admin]), SharedModule, AuthModule],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
