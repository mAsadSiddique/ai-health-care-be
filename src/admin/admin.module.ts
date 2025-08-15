import { Module } from '@nestjs/common'
import { AdminController } from './controllers/admin.controller'
import { AdminService } from './services/admin.service'
import { MongooseModule } from '@nestjs/mongoose'
import { SharedModule } from '../shared/shared.module'
import { AuthModule } from '../auth/auth.module'
import { User, UserSchema } from 'src/user/entities/user.entity'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema }
		]),
		SharedModule,
		AuthModule
	],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
