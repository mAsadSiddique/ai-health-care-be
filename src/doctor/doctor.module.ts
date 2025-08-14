import { Module } from '@nestjs/common'
import { AdminDoctorController } from './controllers/admin-doctor.controller'
import { DoctorController } from './controllers/doctor.controller'
import { DoctorService } from './services/doctor.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Doctor, DoctorSchema } from './entities/doctor.entity'
import { SharedModule } from '../shared/shared.module'
import { AuthModule } from '../auth/auth.module'
import { Admin, AdminSchema } from 'src/admin/entities/admin.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Doctor.name, schema: DoctorSchema },
            { name: Admin.name, schema: AdminSchema }
        ]),
        SharedModule,
        AuthModule
    ],
    controllers: [AdminDoctorController, DoctorController],
    providers: [DoctorService],
    exports: [DoctorService],
})
export class DoctorModule { }
