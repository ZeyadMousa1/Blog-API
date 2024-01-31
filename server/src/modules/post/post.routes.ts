import express from 'express';
import asyncHandler from 'express-async-handler';
import {
   createPostHandler,
   getAllPostsHandler,
   deletePostHandler,
   getSinglePostHandler,
   updatePostHandler,
   updatePostImageHandler,
} from './post.handler';
import { verifyToken } from '../../shared/middelwares/verifyToken';
import { photoUpload } from '../../shared/middelwares/multer';

export const postRouter = express.Router();

postRouter
   .route('/')
   .post(verifyToken, photoUpload.single('image'), asyncHandler(createPostHandler))
   .get(asyncHandler(getAllPostsHandler));

postRouter
   .route('/:id')
   .get(asyncHandler(getSinglePostHandler))
   .delete(verifyToken, asyncHandler(deletePostHandler))
   .put(verifyToken, asyncHandler(updatePostHandler));

postRouter
   .route('/update-image/:id')
   .put(verifyToken, photoUpload.single('image'), asyncHandler(updatePostImageHandler));