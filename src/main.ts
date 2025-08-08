import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as dotenv from 'dotenv'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
	app.enableCors()
	const config = new DocumentBuilder()
		.setTitle('Health Care Portal')
		.setDescription('API collection for managing healthcare data, appointments, patients, and services')
		.setVersion('1.0')
		.addTag('Health Care')
		.addBearerAuth({ type: 'apiKey', name: 'Authorization', in: 'header', bearerFormat: 'JWT' }, 'JWT')
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api', app, document)
	await app.listen(process.env.PORT || 3000)
}
bootstrap()
