import { format } from 'date-fns';

const dateTime = (): string => '[' + format(new Date(), 'yyyy-mm-dd HH:mm:ss.SSS') + ']';

export const log = {
    debug: (...args: unknown[]): void => console.debug(dateTime(), '[DEBUG]', ...args),
    info: (...args: unknown[]): void => console.info(dateTime(), '[INFO]', ...args),
    error: (...args: unknown[]): void => console.error(dateTime(), '[ERROR]', ...args),
};
