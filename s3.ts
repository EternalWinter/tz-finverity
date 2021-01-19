import { config } from 'dotenv';
import { S3 } from 'aws-sdk';
import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import { InternalError } from 'errors';
config();

const { SECRET_ACCESS_KEY_S3, ACCESS_KEY_ID_S3, BUCKET_NAME_S3 } = process.env;

if ([SECRET_ACCESS_KEY_S3, ACCESS_KEY_ID_S3, BUCKET_NAME_S3].some((e) => !e)) {
    throw new InternalError('You should pass the secretAccessKey, accessKeyId and bucketName to S3 instance.');
}

const s3 = new S3({ accessKeyId: ACCESS_KEY_ID_S3, secretAccessKey: SECRET_ACCESS_KEY_S3, region: 'us-east-1' });

export async function uploadFileToS3(
    filename: string,
    req: IncomingMessage | Readable,
): Promise<S3.ManagedUpload.SendData> {
    return await s3.upload({ Bucket: BUCKET_NAME_S3, Key: filename, Body: req }).promise();
}
