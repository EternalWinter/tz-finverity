import { config } from 'dotenv';
import { IncomingHttpHeaders } from 'http';

import { validHeaders } from './config';
config();

const MAX_ALLOWED_FILE_SIZE = process.env.MAX_ALLOWED_FILE_SIZE || 64000;

export function isValidFileLength(headers: IncomingHttpHeaders): boolean {
    return headers && 'content-length' in headers && headers['content-length'] <= MAX_ALLOWED_FILE_SIZE;
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
