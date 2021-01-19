import { config } from 'dotenv';
import { createServer } from 'http';

import { BadRequestError, InternalError } from './errors';
import { uploadFileToS3 } from './s3';
import { getFilenameFromEndpoint, isValidEndpoint, isValidFileLength, isValidHeaders } from './utils';
import { log } from './log';

config();

const { PORT = 3000, MAX_ALLOWED_FILE_SIZE = 1024 * 60 } = process.env;

createServer(async (req, res) => {
    try {
        if (isValidEndpoint(req.url)) {
            if (!isValidHeaders(req.headers) || isValidFileLength(req.headers)) {
                return res.end(
                    JSON.stringify(
                        new BadRequestError(`Check your headers or filesize, max allowed: ${MAX_ALLOWED_FILE_SIZE}`),
                    ),
                );
            }

            const filename = getFilenameFromEndpoint(req.url);
            await uploadFileToS3(filename, req);
            res.end(JSON.stringify({ status: 200, message: `${filename} uploaded` }));
        } else {
            res.end(JSON.stringify(new BadRequestError('Check your url, should be /filename format')));
        }
    } catch (error) {
        res.end(new InternalError());
    }
}).listen(PORT, () => log.info(`Listening at ${PORT}`));

process.on('uncaughtException', (error) => log.error(error));
