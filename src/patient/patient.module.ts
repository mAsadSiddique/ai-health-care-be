import { Module } from '@nestjs/common'
import { PatientController } from './controllers/patient.controller'
import { PatientService } from './services/patient.service'

@Module({
    controllers: [PatientController],
    providers: [PatientService],
    exports: [PatientService],
})
export class PatientModule {}

