export class BadRequestError extends Error {
    code: number;
    description: string;

    constructor(message: string) {
        super();
        this.code = 400;
        this.message = 'Bad Request';
        this.description = message;
    }
}

export class InternalError extends BadRequestError {
    constructor(message?: string) {
        super(message);
        this.code = 500;
        this.message = 'Internal Server Error';
    }
}
