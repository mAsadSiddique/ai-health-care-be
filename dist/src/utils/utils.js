"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageFileFilter = exports.fileExtensionFilter = exports.getSesObject = exports.getWasabiS3Object = exports.getS3Object = void 0;
exports.toBoolean = toBoolean;
exports.convertNumberStringToArray = convertNumberStringToArray;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = require("aws-sdk");
const getS3Object = () => {
    return new aws_sdk_1.S3({
        accessKeyId: process.env.AWS_ACCESSS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        signatureVersion: 'v4',
        region: process.env.AWS_S3_REGION,
    });
};
exports.getS3Object = getS3Object;
const getWasabiS3Object = () => {
    const credentials = new aws_sdk_1.Credentials(process.env.WASABI_ACCESSS_KEY_ID, process.env.WASABI_SECRET_KEY);
    aws_sdk_1.config.credentials = credentials;
    const s3 = new aws_sdk_1.S3({
        endpoint: process.env.WASABI_ENDPOINT,
    });
    return s3;
};
exports.getWasabiS3Object = getWasabiS3Object;
const getSesObject = () => {
    return new aws_sdk_1.SES({
        accessKeyId: process.env.AWS_ACCESSS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        signatureVersion: 'v4',
        region: process.env.AWS_SES_REGION,
    });
};
exports.getSesObject = getSesObject;
const fileExtensionFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(docx|pdf|txt|png|jpeg|jfif|jpg|html|DOCX|PDF|TXT|PNG|JPEG|JFIF|JPG|HTML)$/)) {
        return callback(new common_1.BadRequestException('only image files like .jpg,jfif,jpeg,png,docx,pdf,txt,html are allowed'), false);
    }
    callback(null, true);
};
exports.fileExtensionFilter = fileExtensionFilter;
const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(png|jpeg|jpg|gif|PNG|JPEG|JPG|GIF)$/)) {
        return callback(new common_1.BadRequestException('only image files like .jpg,jpeg,png,gif are allowed'), false);
    }
    callback(undefined, true);
};
exports.imageFileFilter = imageFileFilter;
function toBoolean(value) {
    if (typeof value === 'boolean')
        return value;
    value = value.toLowerCase();
    return value === 'true' || value === '1' ? true : value === 'false' || value === '0' ? false : undefined;
}
function convertNumberStringToArray(value) {
    const stringConvertedToAray = value.trim().split(',');
    const isValid = stringConvertedToAray.every((value) => {
        return Number(value);
    });
    if (!isValid)
        throw new common_1.BadRequestException('should be valid comma separated number string');
    return stringConvertedToAray;
}
//# sourceMappingURL=utils.js.map