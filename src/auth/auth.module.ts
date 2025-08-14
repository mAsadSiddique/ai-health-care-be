import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SharedModule } from './../shared/shared.module'
import { CommonAuthGuard } from './guard/common-auth.guard'
import { Admin, AdminSchema } from '../admin/entities/admin.entity'
import { Doctor, DoctorSchema } from '../doctor/entities/doctor.entity'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Admin.name, schema: AdminSchema },
			{ name: Doctor.name, schema: DoctorSchema }
		]),
		forwardRef(() => SharedModule)
	],
	providers: [CommonAuthGuard],
	exports: [CommonAuthGuard],
})
export class AuthModule {}
