import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import { AppService } from './app.service'
import { AdminModule } from './admin/admin.module'
import { DoctorModule } from './doctor/doctor.module'
import * as dotenv from 'dotenv'
import { ScheduleModule } from '@nestjs/schedule'
import { CacheModule } from '@nestjs/cache-manager'

dotenv.config()

@Module({
	imports: [
		ConfigModule.forRoot({ envFilePath: `config/${process.env.NODE_ENV}.env` }),
		MongooseModule.forRoot(process.env.MONGO_CONNECTION_URL),
		ScheduleModule.forRoot(),
		CacheModule.register({
			isGlobal: true, // Makes the cache available across the entire app
			ttl: 0.5 * 60 * 1000, // Optional: Time-to-live (in milliseconds), default is 30 seconds
			max: 100, // Optional: Maximum number of items in cache
		}),
		AdminModule,
		DoctorModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
