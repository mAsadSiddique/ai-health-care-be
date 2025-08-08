import { DataSource, DataSourceOptions } from 'typeorm'
import * as dotenv from 'dotenv'
dotenv.config()
dotenv.config({ path: `config/${process.env.NODE_ENV}.env` })
const config: DataSourceOptions = {
	type: 'postgres',
	host: process.env.DB_HOST,
	port: +process.env.DB_PORT,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	synchronize: false,
	logging: true,
	entities: [
		'dist/**/*.entity.js'
	],
	migrations: [
		'src/migration/**/*.ts'
	],
}

export const dataSource = new DataSource(config)
