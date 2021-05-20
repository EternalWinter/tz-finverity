import { config } from 'dotenv';
import { createServer } from 'http';
import { BadRequestError, InternalError } from './src/errors';
import { log } from './src/log';
import {
    getFilenameFromEndpoint,
    getTargetSizes,
    isValidEndpoint,
    isValidFileLength,
    isValidHeaders,
    uploadImageToS3WithDifferentSizes,
} from './src/utils';

config();

const { PORT = 3000, MAX_ALLOWED_FILE_SIZE = 1000000 } = process.env;

createServer(async (req, res) => {
    try {
        if (isValidEndpoint(req.url)) {
            if (!isValidHeaders(req.headers) || !isValidFileLength(req.headers)) {
                log.debug('Invalud headers', req.headers);
                return res.end(
                    JSON.stringify(
                        new BadRequestError(`Check your headers or filesize, max allowed: ${MAX_ALLOWED_FILE_SIZE}`),
                    ),
                );
            }

            const filename = getFilenameFromEndpoint(req.url);
            const sizes = getTargetSizes();
            await uploadImageToS3WithDifferentSizes(sizes, filename, req);
            res.end(JSON.stringify({ status: 200, message: `${filename} uploaded` }));
        } else {
            log.debug('Invalid url requested', req.url);
            res.end(JSON.stringify(new BadRequestError('Check your url, should be /filename format')));
        }
    } catch (error) {
        log.error(error);
        res.end(JSON.stringify(new InternalError()));
    }
}).listen(PORT, () => log.info(`Listening at ${PORT}`));

process.on('uncaughtException', (error) => log.error(error));
