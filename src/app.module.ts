import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { AppService } from './app.service'
import { AdminModule } from './admin/admin.module'
import * as dotenv from 'dotenv'
import { ScheduleModule } from '@nestjs/schedule'
import { CacheModule } from '@nestjs/cache-manager'

dotenv.config()

@Module({
	imports: [
		ConfigModule.forRoot({ envFilePath: `config/${process.env.NODE_ENV}.env` }),
		TypeOrmModule.forRoot({
			type: process.env.DB_TYPE as any,
			host: process.env.DB_HOST,
			port: +process.env.DB_PORT,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			charset: 'utf8mb4',
			synchronize: false, // This should always be false, if you want to add , then please do through migration
			logging: false,
			autoLoadEntities: true,
		}),
		ScheduleModule.forRoot(),
		CacheModule.register({
			isGlobal: true, // Makes the cache available across the entire app
			ttl: 0.5 * 60 * 1000, // Optional: Time-to-live (in milliseconds), default is 30 seconds
			max: 100, // Optional: Maximum number of items in cache
		}),
		AdminModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
