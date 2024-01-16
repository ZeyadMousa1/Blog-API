import express from 'express';
import asyncHandler from 'express-async-handler';
import { createPostHandler } from '../handler/post.handler';
import { verifyToken } from '../middelwares/verifyToken';
import { photoUpload } from '../middelwares/photoUpload';

export const postRouter = express.Router();

postRouter
   .route('/')
   .post(verifyToken, photoUpload.single('image'), asyncHandler(createPostHandler));
