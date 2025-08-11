import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SharedModule } from './../shared/shared.module'
import { CommonAuthGuard } from './guard/common-auth.guard'
import { Admin, AdminSchema } from '../admin/entities/admin.entity'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
		forwardRef(() => SharedModule)
	],
	providers: [CommonAuthGuard],
	exports: [CommonAuthGuard],
})
export class AuthModule {}
