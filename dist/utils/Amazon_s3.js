var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('AWS configuration is incomplete. Check your environment variables.');
}
const s3Client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
export function upload(file) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const fileContent = fs.readFileSync(file.path);
        const key = (_a = file.originalname) === null || _a === void 0 ? void 0 : _a.replaceAll(" ", "");
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
        };
        const uploadCommand = new PutObjectCommand(params);
        try {
            console.log(`File uploaded successfully to S3: ${file.originalname}`);
            yield s3Client.send(uploadCommand);
            const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
            return imageUrl;
        }
        catch (error) {
            console.error('Error uploading file to S3:', error);
            throw error;
        }
    });
}
