import { Injectable, Logger } from '@nestjs/common'
import { ExceptionService } from './exception.service'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { getWasabiS3Object } from '../utils/utils'
import * as crypto from 'crypto'
import { RESPONSE_MESSAGES } from '../utils/enums/response_messages.enum'
import { PreviewableFileType } from '../utils/types/previewable_file.type'
import { ObjectType } from '../utils/types/generic_types.type'
import { Between, DataSource, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { BucketParamType } from 'src/utils/types/bucket-param.type'
import { RevenueDto } from './dto/revenue_filters.dto'

@Injectable()
export class SharedService {
	private readonly logger = new Logger(SharedService.name)
	private readonly s3 = getWasabiS3Object()

	constructor(
		private readonly exceptionService: ExceptionService,
		private readonly dataSource: DataSource) { }

	/**
	 * @description send response to client
	 * @param message
	 * @param data
	 * @author Zaigham Javed
	 */
	sendResponse(message: string, data: any = {}) {
		return { message, data, status: 200 }
	}

	/**
	 * @description send error to client
	 * @param error
	 * @param funName
	 * @author Zaigham Javed
	 */
	sendError(error: any, funName: string) {
		this.logger.error(error.message, error, funName)
		if (!error.response) {
			this.exceptionService.sendInternalServerErrorException(RESPONSE_MESSAGES.SERVER_TEMPORY_DOWN)
		}
		throw error
	}

	/**
	 * @description print error in logs
	 * @param error
	 * @param funName
	 * @author Zaigham Javed
	 */
	printError(error: any, funName: string) {
		this.logger.error(error.message, error, funName)
	}

	/**
	 * @description find difference between two date in days
	 * if difference is less than 1 day it will be zero
	 * @param date1
	 * @param date2
	 * @author Zaigham Javed
	 */
	async dateDiffInDays(date1: Date, date2: Date): Promise<number> {
		try {
			const MS_PER_DAY = 1000 * 60 * 60 * 24
			// Discard the time and time-zone information.
			const utc1 = Date.UTC(
				date1.getFullYear(),
				date1.getMonth(),
				date1.getDate(),
				date1.getHours(),
				date1.getMinutes(),
				date1.getSeconds()
			)
			const utc2 = Date.UTC(
				date2.getFullYear(),
				date2.getMonth(),
				date2.getDate(),
				date2.getHours(),
				date2.getMinutes(),
				date2.getSeconds()
			)

			return Math.floor((utc2 - utc1) / MS_PER_DAY)
		} catch (error) {
			this.sendError(error, this.dateDiffInDays.name)
		}
	}

	/**
	 * @description find difference between two date in minutes
	 * @param date1
	 * @param date2
	 * @author Zaigham Javed
	 */
	dateDiffInMins(date1: Date, date2: Date) {
		try {
			let diff = (date1.getTime() - date2.getTime()) / 1000
			diff /= 60
			return Math.abs(Math.round(diff))
		} catch (error) {
			this.sendError(error, this.dateDiffInMins.name)
		}
	}

	/**
	 * @description verify password and confirm password are same
	 * @param password
	 * @param confirmPassword
	 * @author Zaigham Javed
	 */
	passwordsVerificatoin(password: string, confirmPassword: string) {
		try {
			if (password !== confirmPassword) {
				this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED)
			}
			return true
		} catch (error) {
			this.sendError(error, this.passwordsVerificatoin.name)
		}
	}

	/**
	 * @description return hashed password
	 * @param password
	 * @author Zaigham Javed
	 */
	hashedPassword(password: string) {
		try {
			return bcrypt.hashSync(password, +process.env.SALT_ROUND)
		} catch (error) {
			this.sendError(error, this.hashedPassword.name)
		}
	}

	/**
	 * @description verify password are same or not
	 * @param password
	 * @param secondPassword
	 * @author Zaigham Javed
	 */
	passwordVerification(password: string, secondPassword: string) {
		try {
			const isPasswordMatched = bcrypt.compareSync(password, secondPassword)
			if (!isPasswordMatched) {
				this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.INVALID_CREDENTIALS)
			}
			return true
		} catch (error) {
			this.sendError(error, this.passwordVerification.name)
		}
	}

	/**
	 * @description returns jwt
	 * @param payload
	 * @author Zaigham Javed
	 */
	generateJwt(payload: ObjectType) {
		try {
			return jwt.sign({ payload }, process.env.JWT_ENCRYPTION_KEY, { expiresIn: +process.env.JWT_TOKEN_EXPIRY_TIME })
		} catch (error) {
			this.sendError(error, this.generateJwt.name)
		}
	}

	/**
	 * @description returns unique id of 16 digit
	 * @author Zaigham Javed
	 */
	getUniqueId() {
		try {
			return crypto.randomBytes(4 * 2).toString('hex')
		} catch (error) {
			this.sendError(error, this.getUniqueId.name)
		}
	}

	/**
	 * @description returns encrypted text
	 * @param text
	 * @author Zaigham Javed
	 */
	encryptText(text: string) {
		try {
			const iv = Buffer.from(process.env.ENCRYPTION_IV)
			const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32)
			const cipher = crypto.createCipheriv('aes-256-ctr', key, iv)
			const encrypted = cipher.update(text, 'utf8', 'hex')
			return [encrypted + cipher.final('hex'), Buffer.from(iv).toString('hex')].join('|')
		} catch (error) {
			this.sendError(error, this.encryptText.name)
		}
	}

	/**
	 * @description return decrypted text
	 * @param encryptedText
	 * @author Zaigham Javed
	 */
	decryptText(encryptedText: string) {
		try {
			const [encrypted, iv] = encryptedText.split('|')
			if (!iv) throw new Error('IV not found')
			const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32)
			const decipher = crypto.createDecipheriv('aes-256-ctr', key, Buffer.from(iv, 'hex'))
			return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
		} catch (error) {
			this.sendError(error, this.decryptText.name)
		}
	}

	/**
	 * @description verify time delay between to two dates in minutes
	 * and validate it to be more than 5
	 * @param oldDate
	 * @param currentDate
	 * @author Zaigham Javed
	 */
	timeDelayVerification(oldDate: Date, currentDate: Date) {
		try {
			const timeDiff: number = this.dateDiffInMins(oldDate, currentDate)
			if (timeDiff < 5) {
				this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN)
			}
			return true
		} catch (error) {
			this.sendError(error, this.timeDelayVerification.name)
		}
	}

	/**
	 * @description upload single file to bucket and returns key
	 * @param file
	 * @author Zaigham Javed
	 */
	async uploadFileToS3Bucket(file: Express.Multer.File) {
		try {
			const key = Date.now() + file.originalname
			const params = {
				Body: file.buffer,
				Bucket: process.env.BUCKET_NAME,
				Key: key,
			}
			await this.s3.putObject(params).promise()
			return key
		} catch (error) {
			this.sendError(error, this.uploadFileToS3Bucket.name)
		}
	}


	async getFileFromS3Bucket(key: string) {
		try {
			const params = {
				Bucket: process.env.BUCKET_NAME,
				Key: key,
				Expires: 604800
			}
			return await Promise.resolve(this.s3.getSignedUrl('getObject', params))
		} catch (error) {
			throw error
		}
	}

	/**
	 * @description upload multiple file to bucket and returns array of keys
	 * @param files
	 * @author Zaigham Javed
	 */
	async uploadFilesToS3Bucket(files: Express.Multer.File[]) {
		try {
			const requests = []
			const keys = {}
			for (const [objKey, file] of Object.entries(files)) {
				const key = Date.now() + file[0].originalname
				keys[objKey] = key
				const param = {
					Body: file[0].buffer,
					Bucket: process.env.BUCKET_NAME,
					Key: key,
				}
				requests.push(this.s3.putObject(param).promise())
			}
			await Promise.all(requests)
			return keys
		} catch (error) {
			this.sendError(error, this.uploadFilesToS3Bucket.name)
		}
	}

	async findAndRemoveImage(images: ObjectType, imageUrls: ObjectType, imagesToBeRemoved: string[]) {
		try {
			const params: BucketParamType[] = []
			if (images) {
				for (const [keyInDb, value] of Object.entries(images)) {
					const isKeyFound = imagesToBeRemoved.findIndex((key) => key === keyInDb)
					if (isKeyFound !== -1) {
						const param = {
							Bucket: process.env.BUCKET_NAME,
							Key: value,
						}
						params.push(param)
						delete images[keyInDb]
						delete imageUrls[keyInDb]
					}
				}
			}
			return { images, imageUrls, params }
		} catch (error) {
			throw error
		}
	}

	async deleteFilesFromS3Bucket(params: BucketParamType[]) {
		try {
			const request = []
			for (const param of params) {
				request.push(this.s3.deleteObject(param).promise())
			}
			await Promise.all(request)
			return true
		} catch (error) {
			this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.IMAGE_NOT_FOUND)
		}
	}

	/**
	 * @description upload multiple previewable file to bucket with file type and returns array of objects
	 * @param files
	 * @author Zaigham Javed
	 */
	async uploadFilesWithMimeTypeToBucket(files: Express.Multer.File[]) {
		try {
			const requests = []
			const keys = []
			const keysWithMimeTypes: PreviewableFileType[] = []
			for (const file of files) {
				const keyHolder = {
					name: file.originalname,
				}
				const key = Date.now() + file.originalname
				const param = {
					Body: file.buffer,
					Bucket: process.env.BUCKET_NAME,
					Key: key,
				}
				requests.push(this.s3.putObject(param).promise())
				keys.push(key)
				keyHolder[file.mimetype] = key
				keysWithMimeTypes.push(keyHolder)
			}
			await Promise.all(requests)
			return keysWithMimeTypes
		} catch (error) {
			this.sendError(error, this.uploadFilesWithMimeTypeToBucket.name)
		}
	}

	/**
	 * @description fetch file from bucket
	 * @param key
	 * @author Zaigham Javed
	 */
	async getFileFromBucket(key: string) {
		try {
			const params = {
				Bucket: process.env.BUCKET_NAME,
				Key: key,
			}
			try {
				await this.s3.headObject(params).promise()
			} catch (error) {
				console.log(error)
				this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.IMAGE_NOT_FOUND)
			}
			const signedUrl = this.s3.getSignedUrl('getObject', params)
			return signedUrl
		} catch (error) {
			this.sendError(error, this.getFileFromBucket.name)
		}
	}

	/**
	 * @description fetch multiple files from bucket
	 * @param keys
	 * @author Zaigham Javed
	 */
	async getFilesFromS3Bucket(keysWithValue: {}) {
		try {
			const requests = []
			const urlsToBeReturn = {}
			let counter = 0
			for (const [key, value] of Object.entries(keysWithValue)) {
				const param = {
					Bucket: process.env.BUCKET_NAME,
					Key: value,
					Expires: 604800,
				}
				requests.push(this.s3.getSignedUrl('getObject', param))
			}
			const urls = await Promise.all(requests)
			for (const [key, value] of Object.entries(keysWithValue)) {
				urlsToBeReturn[key] = urls[counter]
				counter++
			}
			return urlsToBeReturn
		} catch (error) {
			this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.IMAGE_NOT_FOUND)
		}
	}

	/**
	 * @description fetch multiple previewable files from bucket returns original name and url
	 * @param keys
	 * @author Zaigham Javed
	 */
	async getMultipleFileWithMimeTypeByKeys(keys: PreviewableFileType[]) {
		try {
			const requests = []
			const docNames = []
			for (const keyObj of keys) {
				const [[, name], [key, value]] = Object.entries(keyObj)
				const param = {
					Bucket: process.env.BUCKET_NAME,
					Key: value,
					ResponseContentType: key,
					ResponseContentDisposition: 'inline',
				}
				requests.push(this.s3.getSignedUrl('getObject', param))
				docNames.push(name)
			}
			return { urls: await Promise.all(requests), docNames }
		} catch (error) {
			console.log(error)
			this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.IMAGE_NOT_FOUND)
		}
	}

	/**
	 * @description delete file from bucket
	 * @param key
	 * @author Zaigham Javed
	 */
	async deleteFileFromS3Bucket(key: string) {
		try {
			const params = {
				Bucket: process.env.BUCKET_NAME,
				Key: key,
			}
			return await this.s3.deleteObject(params).promise()
		} catch (error) {
			this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.IMAGE_NOT_FOUND)
		}
	}

	async getUserFromDb(entity: string, email: string) {
		try {
			const repo = this.dataSource.getRepository(entity)
			return await repo.findOne({ where: { email } })
		} catch (error) {
			this.sendError(error, this.getUserFromDb.name)
		}
	}

	bcryptCompareVerificatoin(password: string, userInput: string) {
		try {
			const isPasswordMatched = bcrypt.compareSync(password, userInput)
			if (!isPasswordMatched) {
				this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.INVALID_CREDENTIALS)
			}
			return true
		} catch (error) {
			throw error
		}
	}

	getJwt(payload: ObjectType) {
		try {
			return jwt.sign({ payload }, process.env.JWT_ENCRYPTION_KEY, { expiresIn: +process.env.JWT_TOKEN_EXPIRY_TIME })
		} catch (error) {
			throw error
		}
	}

	delayVerification(userDate: Date) {
		try {
			const currentDate = new Date()
			const timeDiff: number = this.dateDiffInMins(userDate, currentDate)
			if (timeDiff < 5) {
				this.exceptionService.sendNotAcceptableException(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN)
			}
			return true
		} catch (error) {
			throw error
		}
	}

	getDecodedToken(token: string, requestedRoute?: string) {
		try {
			return jwt.verify(token, process.env.JWT_ENCRYPTION_KEY)
		} catch (error) {
			if (
				error.message === 'jwt expired' &&
				(requestedRoute === process.env.ADMIN_LOGOUT_ROUTE || requestedRoute === process.env.USER_LOGOUT_ROUTE)
			) {
				return jwt.decode(token)
			} else {
				this.exceptionDetector(error)
				this.sendError(error, this.getDecodedToken.name)
			}
		}
	}

	exceptionDetector(error) {
		console.error(error)
		if (error.message === 'invalid token' || error.message === 'jwt malformed')
			this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.JWT_INVALID)

		if (error.message === 'jwt expired') this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.JWT_EXPIRED)

		if (error.message === 'invalid signature')
			this.exceptionService.sendUnauthorizedException(RESPONSE_MESSAGES.INVALID_SIGNATURE)

		if (error.response) {
			this.exceptionService.sendUnauthorizedException(error.message)
		}
	}

	appendDateFilterQuery(args: any, entityAlias: string, query: any) {
		try {

			if (args.fromDate && args.toDate) {
				if (args.fromDate > args.toDate) {
					this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.FROM_DATE_MUST_BE_GREATER_THAN_TO_DATE)
				}
				query.andWhere(`${entityAlias}.createdAt BETWEEN :fromDate AND :toDate`, {
					fromDate: new Date(args.fromDate),
					toDate: new Date(new Date(args.toDate).setDate(new Date(args.toDate).getDate() + 1))
				})
			} else if (args.fromDate) {
				query.andWhere(`${entityAlias}.createdAt >= :fromDate`, {
					fromDate: new Date(args.fromDate)
				})
			} else if (args.toDate) {
				query.andWhere(`${entityAlias}.createdAt <= :toDate`, {
					toDate: new Date(new Date(args.toDate).setDate(new Date(args.toDate).getDate() + 1))
				})
			}
		} catch (error) {
			this.sendError(error, this.appendDateFilterQuery.name)
		}
	}

	appendDateFilterCondition(args: RevenueDto, whereClause: ObjectType) {
		try {
			if (args.fromDate && args.toDate) {
				if (args.fromDate > args.toDate) {
					this.exceptionService.sendUnprocessableEntityException(RESPONSE_MESSAGES.FROM_DATE_MUST_BE_GREATER_THAN_TO_DATE)
				}

				whereClause['createdAt'] = Between(new Date(args.fromDate), new Date(new Date(args.toDate).setDate(new Date(args.toDate).getDate() + 1)))
			} else if (args.fromDate) {
				whereClause['createdAt'] = MoreThanOrEqual(new Date(args.fromDate))
			} else if (args.toDate) {
				whereClause['createdAt'] = LessThanOrEqual(new Date(new Date(args.toDate).setDate(new Date(args.toDate).getDate() + 1)))
			}
		} catch (error) {
			this.sendError(error, this.appendDateFilterCondition.name)
		}
	}

}
