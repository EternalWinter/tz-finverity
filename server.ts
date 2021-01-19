import { config } from 'dotenv';
import { createServer, IncomingHttpHeaders } from 'http';
import { S3 } from 'aws-sdk';
config();

const { PORT = 3000, MAX_FILE_SIZE = 1024 } = process.env;
import { validHeaders } from './config';

createServer((req, res) => {
    if (/[\w.]+/.test(req.url)) {
        if (!isValidHeaders(req.headers)) {
            return res.end({ error: 400, message: 'Bad Request' });
        }
        //
    } else {
        res.statusCode = 404;
        res.end();
    }
}).listen(PORT);

function isValidHeaders(headers: IncomingHttpHeaders): boolean {
    return headers && 'content-type' in headers && validHeaders.includes(headers['content-type']);
}
