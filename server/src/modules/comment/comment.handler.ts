import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { validateCreateComment, validateUpdateComment } from './comment.validator';
import { createError } from '../../shared/utils/ApiError';
import { Status } from '../../shared/utils/types';

const prisma = new PrismaClient();

// logged in
export async function createCommentHandler(req: Request, res: Response, next: NextFunction) {
   const { error } = validateCreateComment(req.body);
   if (error) return next(createError(`${error.details[0].message}`, 404, Status.ERROR));
   const { postId, title } = req.body;
   const post = await prisma.post.findUnique({
      where: {
         id: postId,
      },
   });
   if (!post) next(createError('Post not found', 404, Status.FAIL));

   const newComment = await prisma.comment.create({
      data: {
         postId,
         userId: (req as any).currentUser.id,
         title,
      },
   });
   res.status(200).json({
      message: 'comment created successfully',
      newComment,
   });
}

// only admin
export async function getAllCommentsHandler(req: Request, res: Response, next: NextFunction) {
   const comments = await prisma.comment.findMany({
      include: {
         user: {
            select: {
               id: true,
               username: true,
               email: true,
               profilePhoto: true,
               isAdmin: true,
               isAccountVerified: true,
            },
         },
      },
   });
   res.status(200).json(comments);
}

// only admin or owner of the comment
export async function deleteCommentHandler(req: Request, res: Response, next: NextFunction) {
   const { id } = req.params;
   const comment = await prisma.comment.findUnique({
      where: {
         id,
      },
   });
   if (!comment) return next(createError('Comment not found', 404, Status.FAIL));
   if ((req as any).currentUser.isAdmin || comment?.userId === (req as any).currentUser.id) {
      await prisma.comment.delete({
         where: {
            id,
         },
      });
      res.status(200).json({ message: 'comment deleted' });
   } else {
      next(createError('access denied, forbidden', 403, Status.FAIL));
   }
}

// only owner of the comment
export async function updateCommentHandler(req: Request, res: Response, next: NextFunction) {
   const { error } = validateUpdateComment(req.body);
   if (error) return next(createError(`${error.details[0].message}`, 404, Status.ERROR));

   const { id } = req.params;
   const { title } = req.body;
   const comment = await prisma.comment.findUnique({
      where: {
         id,
      },
   });

   if (!comment) return next(createError('Comment not found', 404, Status.ERROR));

   if ((req as any).currentUser.id !== comment?.userId) {
      return next(createError('access denied, forbidden', 403, Status.FAIL));
   }
   const updComment = await prisma.comment.update({
      where: { id },
      data: { title },
   });
   res.status(200).json({
      message: 'comment updated successfully',
      updComment,
   });
}

export async function getAllPostComments(req: Request, res: Response, next: NextFunction) {
   const { postId } = req.params;
   const post = await prisma.post.findUnique({
      where: {
         id: postId,
      },
   });
   if (!post) {
      next(createError('Post not found', 404, Status.FAIL));
   }
   const comments = await prisma.comment.findMany({
      where: {
         postId,
      },
   });
   res.status(200).json({ comments });
}
