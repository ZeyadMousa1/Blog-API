import { ErrorRequestHandler, RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import { Status } from '../utils/types';

export const notFound: RequestHandler = (req, res, next) => {
   return res.status(403).json({ message: `not found ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
   if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
         status: err.statusText,
         message: err.message,
         stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      });
   } else {
      return res.status(500).json({
         status: Status.ERROR,
         msg: 'Something went wrong, please try again',
      });
   }
};
