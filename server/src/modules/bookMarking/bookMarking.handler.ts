import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { createError } from '../../shared/utils/ApiError';
import { Status } from '../../shared/utils/types';

const prisma = new PrismaClient();

export const addToBookMarks = async (req: Request, res: Response, next: NextFunction) => {
   const { id } = req.params;
   const existing = await prisma.postsBookMarking.findFirst({
      where: {
         postId: id,
      },
   });
   if (existing) return next(createError('this post in your bookMearks before', 400, Status.FAIL));

   await prisma.postsBookMarking.create({
      data: {
         userId: (req as any).currentUser.id,
         postId: id,
      },
   });

   res.status(200).json({
      message: 'post added to your bookMarks',
   });
};

export const removeFromBookMarks = async (req: Request, res: Response, next: NextFunction) => {
   const { id } = req.params;
   const existing = await prisma.postsBookMarking.findFirst({
      where: {
         postId: id,
      },
   });
   if (!existing)
      return next(createError('this post not found in your bookMearks', 400, Status.FAIL));

   if (existing.userId === (req as any).currentUser.id) {
      await prisma.postsBookMarking.delete({
         where: {
            id: existing.id,
         },
      });

      res.status(200).json({
         message: 'post deleted from your bookMarks',
      });
   } else {
      next(createError('access denied, forbidden', 403, Status.FAIL));
   }
};

export const getAllBookMarks = async (req: Request, res: Response, next: NextFunction) => {
   const bookMarks = await prisma.postsBookMarking.findMany({
      where: {
         userId: (req as any).currentUser.id,
      },
      select: {
         id: true,
         userId: true,
         post: true,
      },
   });
   res.status(200).json({ bookMarks });
};
