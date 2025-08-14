import { Module } from '@nestjs/common'
import { AdminController } from './controllers/admin.controller'
import { AdminService } from './services/admin.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Admin, AdminSchema } from './entities/admin.entity'
import { Doctor, DoctorSchema } from '../doctor/entities/doctor.entity'
import { SharedModule } from '../shared/shared.module'
import { AuthModule } from '../auth/auth.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Admin.name, schema: AdminSchema },
			{ name: Doctor.name, schema: DoctorSchema }
		]),
		SharedModule,
		AuthModule
	],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
