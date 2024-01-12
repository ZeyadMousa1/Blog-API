import { ErrorRequestHandler, RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';

export const notFound: RequestHandler = (req, res, next) => {
   return res.status(403).json({ message: 'route not found' });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
   if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
         status: err.statusText,
         message: err.message,
      });
   } else {
      return res.status(500).json({
         status: 'ERROR',
         msg: 'Something went wrong, please try again',
      });
   }
};
