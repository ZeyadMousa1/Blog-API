import express from 'express';
import asyncHandler from 'express-async-handler';
import {
   createCommentHandler,
   deleteCommentHandler,
   getAllCommentsHandler,
   getAllPostComments,
   updateCommentHandler,
} from './comment.handler';
import { verifyToken } from '../../shared/middelwares/verifyToken';
import { verifyTokeAndIsAdminRole } from '../../shared/middelwares/manageRoles';
export const commentRouter = express.Router();

commentRouter
   .route('/')
   .post(verifyToken, asyncHandler(createCommentHandler))
   .get(verifyTokeAndIsAdminRole, asyncHandler(getAllCommentsHandler));

commentRouter
   .route('/:id')
   .delete(verifyToken, asyncHandler(deleteCommentHandler))
   .put(verifyToken, asyncHandler(updateCommentHandler));

commentRouter.route('/:postId').get(asyncHandler(getAllPostComments));
