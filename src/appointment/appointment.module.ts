import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppointmentController } from './controllers/appointment.controller'
import { AdminAppointmentController } from './controllers/admin-appointment.controller'
import { AppointmentService } from './services/appointment.service'
import { Appointment, AppointmentSchema } from './entities/appointment.entity'
import { User, UserSchema } from '../user/entities/user.entity'
import { SharedModule } from '../shared/shared.module'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Appointment.name, schema: AppointmentSchema },
            { name: User.name, schema: UserSchema }
        ]),
        SharedModule
    ],
    controllers: [AppointmentController, AdminAppointmentController],
    providers: [AppointmentService],
    exports: [AppointmentService]
})
export class AppointmentModule { }
