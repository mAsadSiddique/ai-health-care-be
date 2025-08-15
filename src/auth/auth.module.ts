import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SharedModule } from './../shared/shared.module'
import { CommonAuthGuard } from './guard/common-auth.guard'
import { User, UserSchema } from '../user/entities/user.entity'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema }
		]),
		forwardRef(() => SharedModule)
	],
	providers: [CommonAuthGuard],
	exports: [CommonAuthGuard],
})
export class AuthModule {}
