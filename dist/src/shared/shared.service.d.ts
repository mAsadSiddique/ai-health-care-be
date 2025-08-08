import { ExceptionService } from './exception.service';
import * as jwt from 'jsonwebtoken';
import { PreviewableFileType } from '../utils/types/previewable_file.type';
import { ObjectType } from '../utils/types/generic_types.type';
import { DataSource } from 'typeorm';
import { BucketParamType } from 'src/utils/types/bucket-param.type';
import { RevenueDto } from './dto/revenue_filters.dto';
export declare class SharedService {
    private readonly exceptionService;
    private readonly dataSource;
    private readonly logger;
    private readonly s3;
    constructor(exceptionService: ExceptionService, dataSource: DataSource);
    sendResponse(message: string, data?: any): {
        message: string;
        data: any;
        status: number;
    };
    sendError(error: any, funName: string): void;
    printError(error: any, funName: string): void;
    dateDiffInDays(date1: Date, date2: Date): Promise<number>;
    dateDiffInMins(date1: Date, date2: Date): number;
    passwordsVerificatoin(password: string, confirmPassword: string): boolean;
    hashedPassword(password: string): any;
    passwordVerification(password: string, secondPassword: string): boolean;
    generateJwt(payload: ObjectType): string;
    getUniqueId(): string;
    encryptText(text: string): string;
    decryptText(encryptedText: string): string;
    timeDelayVerification(oldDate: Date, currentDate: Date): boolean;
    uploadFileToS3Bucket(file: Express.Multer.File): Promise<string>;
    getFileFromS3Bucket(key: string): Promise<string>;
    uploadFilesToS3Bucket(files: Express.Multer.File[]): Promise<{}>;
    findAndRemoveImage(images: ObjectType, imageUrls: ObjectType, imagesToBeRemoved: string[]): Promise<{
        images: ObjectType;
        imageUrls: ObjectType;
        params: BucketParamType[];
    }>;
    deleteFilesFromS3Bucket(params: BucketParamType[]): Promise<boolean>;
    uploadFilesWithMimeTypeToBucket(files: Express.Multer.File[]): Promise<PreviewableFileType[]>;
    getFileFromBucket(key: string): Promise<string>;
    getFilesFromS3Bucket(keysWithValue: {}): Promise<{}>;
    getMultipleFileWithMimeTypeByKeys(keys: PreviewableFileType[]): Promise<{
        urls: any[];
        docNames: any[];
    }>;
    deleteFileFromS3Bucket(key: string): Promise<import("aws-sdk/lib/request").PromiseResult<import("aws-sdk/clients/s3").DeleteObjectOutput, import("aws-sdk").AWSError>>;
    getUserFromDb(entity: string, email: string): Promise<import("typeorm").ObjectLiteral>;
    bcryptCompareVerificatoin(password: string, userInput: string): boolean;
    getJwt(payload: ObjectType): string;
    delayVerification(userDate: Date): boolean;
    getDecodedToken(token: string, requestedRoute?: string): string | jwt.JwtPayload;
    exceptionDetector(error: any): void;
    appendDateFilterQuery(args: any, entityAlias: string, query: any): void;
    appendDateFilterCondition(args: RevenueDto, whereClause: ObjectType): void;
}
