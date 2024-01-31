import express from 'express';
import asyncHandler from 'express-async-handler';
import { verifyToken } from '../../shared/middelwares/verifyToken';
import { addToBookMarks, getAllBookMarks, removeFromBookMarks } from './bookMarking.handler';

export const bookMarkingRouter = express.Router();

bookMarkingRouter
   .route('/:id')
   .post(verifyToken, asyncHandler(addToBookMarks))
   .delete(verifyToken, asyncHandler(removeFromBookMarks));

bookMarkingRouter.route('/').get(verifyToken, asyncHandler(getAllBookMarks));
