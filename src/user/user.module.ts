import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CacheModule } from '@nestjs/cache-manager'
import { User, UserSchema } from './entities/user.entity'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { SharedModule } from '../shared/shared.module'
import { AdminUserController } from './admin-user.controller'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ]),
        CacheModule.register({
            ttl: 300000, // 5 minutes
            max: 100,
        }),
        SharedModule,
    ],
    controllers: [UserController, AdminUserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
