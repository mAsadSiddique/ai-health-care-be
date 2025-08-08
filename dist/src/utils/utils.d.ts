import { S3, SES } from 'aws-sdk';
import { callbackType } from './types/generic_types.type';
export declare const getS3Object: () => S3;
export declare const getWasabiS3Object: () => S3;
export declare const getSesObject: () => SES;
export declare const fileExtensionFilter: (req: Request, file: Express.Multer.File, callback: callbackType) => void;
export declare const imageFileFilter: (req: Request, file: Express.Multer.File, callback: callbackType) => void;
export declare function toBoolean(value: string): boolean;
export declare function convertNumberStringToArray(value: string): string[];
