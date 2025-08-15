import { Module } from '@nestjs/common'
import { AdminDoctorController } from './controllers/admin-doctor.controller'
import { DoctorController } from './controllers/doctor.controller'
import { DoctorService } from './services/doctor.service'
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
    controllers: [AdminDoctorController, DoctorController],
    providers: [DoctorService],
    exports: [DoctorService],
})
export class DoctorModule { }
