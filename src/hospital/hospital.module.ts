import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Hospital, HospitalSchema } from './entities/hospital.entity'
import { HospitalService } from './services/hospital.service'
import { AdminHospitalController } from './controllers/admin-hospital.controller'
import { SharedModule } from '../shared/shared.module'
import { AuthModule } from 'src/auth/auth.module'
import { User, UserSchema } from 'src/user/entities/user.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Hospital.name, schema: HospitalSchema },
            { name: User.name, schema: UserSchema }
        ]),
        SharedModule,
        AuthModule
    ],
    controllers: [AdminHospitalController],
    providers: [HospitalService],
    exports: [HospitalService]
})
export class HospitalModule { }

