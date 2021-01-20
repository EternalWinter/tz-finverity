import { randomBytes } from 'crypto';
import { config } from 'dotenv';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import * as sharp from 'sharp';
import { uploadFileToS3 } from './s3';
import { validHeaders } from './config';

config();

const {
    MAX_ALLOWED_FILE_SIZE = 64000,
    LARGE_IMAGE_SIZE = 2048,
    MEDIUM_IMAGE_SIZE = 1024,
    THUMB_IMAGE_SIZE = 300,
} = process.env;

export function isValidFileLength(headers: IncomingHttpHeaders): boolean {
    const max = typeof MAX_ALLOWED_FILE_SIZE === 'string' ? parseInt(MAX_ALLOWED_FILE_SIZE, 10) : MAX_ALLOWED_FILE_SIZE;
    return headers && 'content-length' in headers && parseInt(headers['content-length'], 10) <= max;
}

export function isValidEndpoint(endpoint: string): boolean {
    return endpoint.length > 1 && /(?<=\/)[\w.-]+/.test(endpoint);
}

export function isValidHeaders(headers: IncomingHttpHeaders): boolean {
    return headers && 'content-type' in headers && validHeaders.includes(headers['content-type']);
}

export function getFilenameFromEndpoint(url: string): string {
    return url.split('/')[1];
}

export function hashFilename(filename: string, extra?: string | number): string {
    const [fileName, ext] = filename.split('.');
    const hash = randomBytes(10).toString('hex');

    return `${fileName}-${hash}-${extra || 0}.${ext}`;
}

export function getTargetSizes(): number[] {
    const large = typeof LARGE_IMAGE_SIZE === 'string' ? parseInt(LARGE_IMAGE_SIZE, 10) : LARGE_IMAGE_SIZE;
    const medium = typeof MEDIUM_IMAGE_SIZE === 'string' ? parseInt(MEDIUM_IMAGE_SIZE, 10) : MEDIUM_IMAGE_SIZE;
    const thumb = typeof THUMB_IMAGE_SIZE === 'string' ? parseInt(THUMB_IMAGE_SIZE, 10) : THUMB_IMAGE_SIZE;

    return [large, medium, thumb];
}

export async function uploadImageToS3WithDifferentSizes(
    sizes: number[],
    filename: string,
    req: IncomingMessage,
): Promise<void> {
    const pipeline = sharp();
    const promises = [];

    for (const size of sizes) {
        const hashedFilename = hashFilename(filename, size);
        const { promise, writeStream } = uploadFileToS3(hashedFilename);
        promises.push(promise);
        pipeline.clone().resize(size, size, { fit: 'fill' }).pipe(writeStream);
    }
    req.pipe(pipeline, { end: true });
    await Promise.all(promises);
}
