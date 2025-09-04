import { Module } from '@nestjs/common'
import { PatientController } from './controllers/patient.controller'
import { PatientService } from './services/patient.service'
import { MongooseModule } from '@nestjs/mongoose'
import { SharedModule } from '../shared/shared.module'
import { AuthModule } from '../auth/auth.module'
import { User, UserSchema } from 'src/user/entities/user.entity'
import { DoctorPatientController } from './controllers/doctor.controller'
import { PatientAnalyzeData, PatientAnalyzeDataSchema } from 'src/user/entities/patient_analyze_data.entity'
import { GoogleStrategy } from './social_login-strategies/google.strategy'
import { HospitalModule } from '../hospital/hospital.module'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: PatientAnalyzeData.name, schema: PatientAnalyzeDataSchema }
        ]),
        SharedModule,
        AuthModule,
        HospitalModule
    ],
    controllers: [PatientController, DoctorPatientController],
    providers: [PatientService, GoogleStrategy],
    exports: [PatientService],
})
export class PatientModule {}

