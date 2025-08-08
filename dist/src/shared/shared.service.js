"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SharedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedService = void 0;
const common_1 = require("@nestjs/common");
const exception_service_1 = require("./exception.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const utils_1 = require("../utils/utils");
const crypto = require("crypto");
const response_messages_enum_1 = require("../utils/enums/response_messages.enum");
const typeorm_1 = require("typeorm");
let SharedService = SharedService_1 = class SharedService {
    constructor(exceptionService, dataSource) {
        this.exceptionService = exceptionService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(SharedService_1.name);
        this.s3 = (0, utils_1.getWasabiS3Object)();
    }
    sendResponse(message, data = {}) {
        return { message, data, status: 200 };
    }
    sendError(error, funName) {
        this.logger.error(error.message, error, funName);
        if (!error.response) {
            this.exceptionService.sendInternalServerErrorException(response_messages_enum_1.RESPONSE_MESSAGES.SERVER_TEMPORY_DOWN);
        }
        throw error;
    }
    printError(error, funName) {
        this.logger.error(error.message, error, funName);
    }
    async dateDiffInDays(date1, date2) {
        try {
            const MS_PER_DAY = 1000 * 60 * 60 * 24;
            const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate(), date1.getHours(), date1.getMinutes(), date1.getSeconds());
            const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate(), date2.getHours(), date2.getMinutes(), date2.getSeconds());
            return Math.floor((utc2 - utc1) / MS_PER_DAY);
        }
        catch (error) {
            this.sendError(error, this.dateDiffInDays.name);
        }
    }
    dateDiffInMins(date1, date2) {
        try {
            let diff = (date1.getTime() - date2.getTime()) / 1000;
            diff /= 60;
            return Math.abs(Math.round(diff));
        }
        catch (error) {
            this.sendError(error, this.dateDiffInMins.name);
        }
    }
    passwordsVerificatoin(password, confirmPassword) {
        try {
            if (password !== confirmPassword) {
                this.exceptionService.sendNotAcceptableException(response_messages_enum_1.RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED);
            }
            return true;
        }
        catch (error) {
            this.sendError(error, this.passwordsVerificatoin.name);
        }
    }
    hashedPassword(password) {
        try {
            return bcrypt.hashSync(password, +process.env.SALT_ROUND);
        }
        catch (error) {
            this.sendError(error, this.hashedPassword.name);
        }
    }
    passwordVerification(password, secondPassword) {
        try {
            const isPasswordMatched = bcrypt.compareSync(password, secondPassword);
            if (!isPasswordMatched) {
                this.exceptionService.sendForbiddenException(response_messages_enum_1.RESPONSE_MESSAGES.INVALID_CREDENTIALS);
            }
            return true;
        }
        catch (error) {
            this.sendError(error, this.passwordVerification.name);
        }
    }
    generateJwt(payload) {
        try {
            return jwt.sign({ payload }, process.env.JWT_ENCRYPTION_KEY, { expiresIn: +process.env.JWT_TOKEN_EXPIRY_TIME });
        }
        catch (error) {
            this.sendError(error, this.generateJwt.name);
        }
    }
    getUniqueId() {
        try {
            return crypto.randomBytes(4 * 2).toString('hex');
        }
        catch (error) {
            this.sendError(error, this.getUniqueId.name);
        }
    }
    encryptText(text) {
        try {
            const iv = Buffer.from(process.env.ENCRYPTION_IV);
            const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
            const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
            const encrypted = cipher.update(text, 'utf8', 'hex');
            return [encrypted + cipher.final('hex'), Buffer.from(iv).toString('hex')].join('|');
        }
        catch (error) {
            this.sendError(error, this.encryptText.name);
        }
    }
    decryptText(encryptedText) {
        try {
            const [encrypted, iv] = encryptedText.split('|');
            if (!iv)
                throw new Error('IV not found');
            const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
            const decipher = crypto.createDecipheriv('aes-256-ctr', key, Buffer.from(iv, 'hex'));
            return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
        }
        catch (error) {
            this.sendError(error, this.decryptText.name);
        }
    }
    timeDelayVerification(oldDate, currentDate) {
        try {
            const timeDiff = this.dateDiffInMins(oldDate, currentDate);
            if (timeDiff < 5) {
                this.exceptionService.sendNotAcceptableException(response_messages_enum_1.RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN);
            }
            return true;
        }
        catch (error) {
            this.sendError(error, this.timeDelayVerification.name);
        }
    }
    async uploadFileToS3Bucket(file) {
        try {
            const key = Date.now() + file.originalname;
            const params = {
                Body: file.buffer,
                Bucket: process.env.BUCKET_NAME,
                Key: key,
            };
            await this.s3.putObject(params).promise();
            return key;
        }
        catch (error) {
            this.sendError(error, this.uploadFileToS3Bucket.name);
        }
    }
    async getFileFromS3Bucket(key) {
        try {
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: key,
                Expires: 604800
            };
            return await Promise.resolve(this.s3.getSignedUrl('getObject', params));
        }
        catch (error) {
            throw error;
        }
    }
    async uploadFilesToS3Bucket(files) {
        try {
            const requests = [];
            const keys = {};
            for (const [objKey, file] of Object.entries(files)) {
                const key = Date.now() + file[0].originalname;
                keys[objKey] = key;
                const param = {
                    Body: file[0].buffer,
                    Bucket: process.env.BUCKET_NAME,
                    Key: key,
                };
                requests.push(this.s3.putObject(param).promise());
            }
            await Promise.all(requests);
            return keys;
        }
        catch (error) {
            this.sendError(error, this.uploadFilesToS3Bucket.name);
        }
    }
    async findAndRemoveImage(images, imageUrls, imagesToBeRemoved) {
        try {
            const params = [];
            if (images) {
                for (const [keyInDb, value] of Object.entries(images)) {
                    const isKeyFound = imagesToBeRemoved.findIndex((key) => key === keyInDb);
                    if (isKeyFound !== -1) {
                        const param = {
                            Bucket: process.env.BUCKET_NAME,
                            Key: value,
                        };
                        params.push(param);
                        delete images[keyInDb];
                        delete imageUrls[keyInDb];
                    }
                }
            }
            return { images, imageUrls, params };
        }
        catch (error) {
            throw error;
        }
    }
    async deleteFilesFromS3Bucket(params) {
        try {
            const request = [];
            for (const param of params) {
                request.push(this.s3.deleteObject(param).promise());
            }
            await Promise.all(request);
            return true;
        }
        catch (error) {
            this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.IMAGE_NOT_FOUND);
        }
    }
    async uploadFilesWithMimeTypeToBucket(files) {
        try {
            const requests = [];
            const keys = [];
            const keysWithMimeTypes = [];
            for (const file of files) {
                const keyHolder = {
                    name: file.originalname,
                };
                const key = Date.now() + file.originalname;
                const param = {
                    Body: file.buffer,
                    Bucket: process.env.BUCKET_NAME,
                    Key: key,
                };
                requests.push(this.s3.putObject(param).promise());
                keys.push(key);
                keyHolder[file.mimetype] = key;
                keysWithMimeTypes.push(keyHolder);
            }
            await Promise.all(requests);
            return keysWithMimeTypes;
        }
        catch (error) {
            this.sendError(error, this.uploadFilesWithMimeTypeToBucket.name);
        }
    }
    async getFileFromBucket(key) {
        try {
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: key,
            };
            try {
                await this.s3.headObject(params).promise();
            }
            catch (error) {
                console.log(error);
                this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.IMAGE_NOT_FOUND);
            }
            const signedUrl = this.s3.getSignedUrl('getObject', params);
            return signedUrl;
        }
        catch (error) {
            this.sendError(error, this.getFileFromBucket.name);
        }
    }
    async getFilesFromS3Bucket(keysWithValue) {
        try {
            const requests = [];
            const urlsToBeReturn = {};
            let counter = 0;
            for (const [key, value] of Object.entries(keysWithValue)) {
                const param = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: value,
                    Expires: 604800,
                };
                requests.push(this.s3.getSignedUrl('getObject', param));
            }
            const urls = await Promise.all(requests);
            for (const [key, value] of Object.entries(keysWithValue)) {
                urlsToBeReturn[key] = urls[counter];
                counter++;
            }
            return urlsToBeReturn;
        }
        catch (error) {
            this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.IMAGE_NOT_FOUND);
        }
    }
    async getMultipleFileWithMimeTypeByKeys(keys) {
        try {
            const requests = [];
            const docNames = [];
            for (const keyObj of keys) {
                const [[, name], [key, value]] = Object.entries(keyObj);
                const param = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: value,
                    ResponseContentType: key,
                    ResponseContentDisposition: 'inline',
                };
                requests.push(this.s3.getSignedUrl('getObject', param));
                docNames.push(name);
            }
            return { urls: await Promise.all(requests), docNames };
        }
        catch (error) {
            console.log(error);
            this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.IMAGE_NOT_FOUND);
        }
    }
    async deleteFileFromS3Bucket(key) {
        try {
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: key,
            };
            return await this.s3.deleteObject(params).promise();
        }
        catch (error) {
            this.exceptionService.sendNotFoundException(response_messages_enum_1.RESPONSE_MESSAGES.IMAGE_NOT_FOUND);
        }
    }
    async getUserFromDb(entity, email) {
        try {
            const repo = this.dataSource.getRepository(entity);
            return await repo.findOne({ where: { email } });
        }
        catch (error) {
            this.sendError(error, this.getUserFromDb.name);
        }
    }
    bcryptCompareVerificatoin(password, userInput) {
        try {
            const isPasswordMatched = bcrypt.compareSync(password, userInput);
            if (!isPasswordMatched) {
                this.exceptionService.sendNotAcceptableException(response_messages_enum_1.RESPONSE_MESSAGES.INVALID_CREDENTIALS);
            }
            return true;
        }
        catch (error) {
            throw error;
        }
    }
    getJwt(payload) {
        try {
            return jwt.sign({ payload }, process.env.JWT_ENCRYPTION_KEY, { expiresIn: +process.env.JWT_TOKEN_EXPIRY_TIME });
        }
        catch (error) {
            throw error;
        }
    }
    delayVerification(userDate) {
        try {
            const currentDate = new Date();
            const timeDiff = this.dateDiffInMins(userDate, currentDate);
            if (timeDiff < 5) {
                this.exceptionService.sendNotAcceptableException(response_messages_enum_1.RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN);
            }
            return true;
        }
        catch (error) {
            throw error;
        }
    }
    getDecodedToken(token, requestedRoute) {
        try {
            return jwt.verify(token, process.env.JWT_ENCRYPTION_KEY);
        }
        catch (error) {
            if (error.message === 'jwt expired' &&
                (requestedRoute === process.env.ADMIN_LOGOUT_ROUTE || requestedRoute === process.env.USER_LOGOUT_ROUTE)) {
                return jwt.decode(token);
            }
            else {
                this.exceptionDetector(error);
                this.sendError(error, this.getDecodedToken.name);
            }
        }
    }
    exceptionDetector(error) {
        console.error(error);
        if (error.message === 'invalid token' || error.message === 'jwt malformed')
            this.exceptionService.sendUnauthorizedException(response_messages_enum_1.RESPONSE_MESSAGES.JWT_INVALID);
        if (error.message === 'jwt expired')
            this.exceptionService.sendUnauthorizedException(response_messages_enum_1.RESPONSE_MESSAGES.JWT_EXPIRED);
        if (error.message === 'invalid signature')
            this.exceptionService.sendUnauthorizedException(response_messages_enum_1.RESPONSE_MESSAGES.INVALID_SIGNATURE);
        if (error.response) {
            this.exceptionService.sendUnauthorizedException(error.message);
        }
    }
    appendDateFilterQuery(args, entityAlias, query) {
        try {
            if (args.fromDate && args.toDate) {
                if (args.fromDate > args.toDate) {
                    this.exceptionService.sendUnprocessableEntityException(response_messages_enum_1.RESPONSE_MESSAGES.FROM_DATE_MUST_BE_GREATER_THAN_TO_DATE);
                }
                query.andWhere(`${entityAlias}.createdAt BETWEEN :fromDate AND :toDate`, {
                    fromDate: new Date(args.fromDate),
                    toDate: new Date(new Date(args.toDate).setDate(new Date(args.toDate).getDate() + 1))
                });
            }
            else if (args.fromDate) {
                query.andWhere(`${entityAlias}.createdAt >= :fromDate`, {
                    fromDate: new Date(args.fromDate)
                });
            }
            else if (args.toDate) {
                query.andWhere(`${entityAlias}.createdAt <= :toDate`, {
                    toDate: new Date(new Date(args.toDate).setDate(new Date(args.toDate).getDate() + 1))
                });
            }
        }
        catch (error) {
            this.sendError(error, this.appendDateFilterQuery.name);
        }
    }
    appendDateFilterCondition(args, whereClause) {
        try {
            if (args.fromDate && args.toDate) {
                if (args.fromDate > args.toDate) {
                    this.exceptionService.sendUnprocessableEntityException(response_messages_enum_1.RESPONSE_MESSAGES.FROM_DATE_MUST_BE_GREATER_THAN_TO_DATE);
                }
                whereClause['createdAt'] = (0, typeorm_1.Between)(new Date(args.fromDate), new Date(new Date(args.toDate).setDate(new Date(args.toDate).getDate() + 1)));
            }
            else if (args.fromDate) {
                whereClause['createdAt'] = (0, typeorm_1.MoreThanOrEqual)(new Date(args.fromDate));
            }
            else if (args.toDate) {
                whereClause['createdAt'] = (0, typeorm_1.LessThanOrEqual)(new Date(new Date(args.toDate).setDate(new Date(args.toDate).getDate() + 1)));
            }
        }
        catch (error) {
            this.sendError(error, this.appendDateFilterCondition.name);
        }
    }
};
exports.SharedService = SharedService;
exports.SharedService = SharedService = SharedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [exception_service_1.ExceptionService,
        typeorm_1.DataSource])
], SharedService);
//# sourceMappingURL=shared.service.js.map