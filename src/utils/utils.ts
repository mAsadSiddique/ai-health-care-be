import { BadRequestException } from '@nestjs/common'
import { Credentials, S3, SES, config } from 'aws-sdk'
import { callbackType } from './types/generic_types.type'

/**
 * @description returns Bucket S3 object
 * @author Zaigham Javed
 */
export const getS3Object = () => {
	return new S3({
		accessKeyId: process.env.AWS_ACCESSS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_KEY,
		signatureVersion: 'v4',
		region: process.env.AWS_S3_REGION,
	})
}

export const getWasabiS3Object = () => {

	const credentials: Credentials = new Credentials(process.env.WASABI_ACCESSS_KEY_ID, process.env.WASABI_SECRET_KEY)
	config.credentials = credentials
	const s3: S3 = new S3({
		endpoint: process.env.WASABI_ENDPOINT,
	})
	return s3

}

/**
 * @description returns Aws Simple Email Service(SES) object
 * @author Zaigham Javed
 */
export const getSesObject = () => {
	return new SES({
		accessKeyId: process.env.AWS_ACCESSS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_KEY,
		signatureVersion: 'v4',
		region: process.env.AWS_SES_REGION,
	})
}

/**
 * This function takes file from multer and validate the allowed file extension
 * used in case of form data
 * @param req
 * @returns boolean
 */
export const fileExtensionFilter = (req: Request, file: Express.Multer.File, callback: callbackType) => {
	if (!file.originalname.match(/\.(docx|pdf|txt|png|jpeg|jfif|jpg|html|DOCX|PDF|TXT|PNG|JPEG|JFIF|JPG|HTML)$/)) {
		return callback(
			new BadRequestException('only image files like .jpg,jfif,jpeg,png,docx,pdf,txt,html are allowed'),
			false
		)
	}
	callback(null, true)
}

export const imageFileFilter = (req: Request, file: Express.Multer.File, callback: callbackType) => {
	if (!file.originalname.match(/\.(png|jpeg|jpg|gif|PNG|JPEG|JPG|GIF)$/)) {
		return callback(new BadRequestException('only image files like .jpg,jpeg,png,gif are allowed'), false)
	}
	callback(undefined, true)
}

/**
 * This function takes stringify boolean or number string and convert it to boolean value
 * used in case of form data
 * @param value
 * @returns booelan value or undefined
 */
export function toBoolean(value: string): boolean {
	if (typeof value === 'boolean') return value
	value = value.toLowerCase()
	return value === 'true' || value === '1' ? true : value === 'false' || value === '0' ? false : undefined
}

/**
 * This function takes comma separated number string and convert it to array
 * used in case of form data
 * @param value
 * @returns array of string
 */
export function convertNumberStringToArray(value: string) {
	const stringConvertedToAray = value.trim().split(',')
	const isValid = stringConvertedToAray.every((value) => {
		return Number(value)
	})
	if (!isValid) throw new BadRequestException('should be valid comma separated number string')
	return stringConvertedToAray
}
