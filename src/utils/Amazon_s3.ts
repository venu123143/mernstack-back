import fs from 'fs';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

// Ensure all required AWS credentials are set
if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('AWS configuration is incomplete. Check your environment variables.');
}

const s3Client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });


// upload the images to amazon s3.
export async function upload(file: any) {
    // Read the file from the local file system
    const fileContent = fs.readFileSync(file.path);

    // Set up the parameters for the S3 upload
    const key = file.originalname?.replaceAll(" ", "")
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
    };
    const uploadCommand = new PutObjectCommand(params);
    try {
        console.log(`File uploaded successfully to S3: ${file.originalname}`);
        await s3Client.send(uploadCommand);

        const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
        return imageUrl

    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
    }
}
