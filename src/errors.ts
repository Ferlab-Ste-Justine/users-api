import { NextFunction, Request, Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { HttpError } from 'http-errors';
import {
    BaseError,
    UniqueConstraintError,
} from 'sequelize';

export const globalErrorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof UniqueConstraintError) {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
            error: 'A resource with the same id already exists.',
        });
    } else if (err instanceof HttpError) {
        res.status(err.status).json({
            error: err.message,
        });
    } else if (err instanceof Error || err instanceof BaseError) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        });
    } else {
        throw err;
    }
};

export const globalErrorLogger = (err: unknown, _req: Request, _res: Response, next: NextFunction): void => {
    console.log(err);
    next(err);
};
