import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function toggleLikeHandler(req: Request, res: Response, next: NextFunction) {
   const { postId } = req.params;
   const existingLike = await prisma.like.findFirst({
      where: {
         userId: (req as any).currentUser.id,
         postId,
      },
   });
   if (existingLike) {
      await prisma.like.delete({
         where: {
            id: existingLike.id,
         },
      });
      res.status(200).json({ status: 'unLiked' });
   } else {
      await prisma.like.create({
         data: {
            userId: (req as any).currentUser.id,
            postId,
         },
      });
      res.status(200).json({ status: 'Liked' });
   }
}

export async function getAllLikes(req: Request, res: Response, next: NextFunction) {
   const { postId } = req.params;
   const likes = await prisma.like.findMany({
      where: {
         postId,
      },
      select: {
         id: true,
         createdAt: true,
         userId: true,
         user: true,
      },
   });
   res.status(200).json({ likes });
}
