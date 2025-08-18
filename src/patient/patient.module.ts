import { Module } from '@nestjs/common'
import { PatientController } from './controllers/patient.controller'
import { PatientService } from './services/patient.service'
import { MongooseModule } from '@nestjs/mongoose'
import { SharedModule } from '../shared/shared.module'
import { AuthModule } from '../auth/auth.module'
import { User, UserSchema } from 'src/user/entities/user.entity'
import { DoctorPatientController } from './controllers/doctor.controller'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ]),
        SharedModule,
        AuthModule
    ],
    controllers: [PatientController, DoctorPatientController],
    providers: [PatientService],
    exports: [PatientService],
})
export class PatientModule {}

