import express from 'express';
import { verifyToken } from '../../shared/middelwares/verifyToken';
import { toggleLikeHandler } from './like.handler';
import asyncHandler from 'express-async-handler';

export const likeRouter = express.Router();

likeRouter.route('/:postId').put(verifyToken, asyncHandler(toggleLikeHandler));
