import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ExceptionService } from './exception.service'
import { SharedService } from './shared.service'
import { StatisticsService } from './services/statistics.service'
import { StatisticsController } from './controllers/statistics.controller'
import { User, UserSchema } from '../user/entities/user.entity'
import { Appointment, AppointmentSchema } from '../appointment/entities/appointment.entity'
import { PatientAnalyzeData, PatientAnalyzeDataSchema } from '../user/entities/patient_analyze_data.entity'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Appointment.name, schema: AppointmentSchema },
			{ name: PatientAnalyzeData.name, schema: PatientAnalyzeDataSchema }
		])
	],
	providers: [ExceptionService, SharedService, StatisticsService],
	controllers: [StatisticsController],
	exports: [ExceptionService, SharedService, StatisticsService],
})
export class SharedModule {}
