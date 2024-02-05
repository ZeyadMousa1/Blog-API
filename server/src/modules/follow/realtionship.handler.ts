import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../../shared/utils/ApiError';
import { Status } from '../../shared/utils/types';

const prisma = new PrismaClient();

export const FollowOrUnFollowHandler = async (req: Request, res: Response, next: NextFunction) => {
   const { userId } = req.params;

   const follower = await prisma.user.findUnique({
      where: {
         id: userId,
      },
   });
   if (!follower) {
      next(createError('user not found', 404, Status.FAIL));
   }
   const existingRelationship = await prisma.relationship.findFirst({
      where: {
         followerId: userId,
         followingId: (req as any).currentUser.id,
      },
   });

   if ((req as any).currentUser.id === userId)
      return next(createError('Cant be follow your self', 403, Status.FAIL));

   if (existingRelationship) {
      await prisma.relationship.delete({
         where: {
            id: existingRelationship.id,
         },
      });
      res.status(200).json({ message: `your unfollow ${follower?.username}` });
   } else {
      await prisma.relationship.create({
         data: {
            followingId: (req as any).currentUser.id,
            followerId: userId,
         },
      });
      res.status(200).json({ message: `your followed ${follower?.username} successfully` });
   }
};

export const getAllFollowingHandler = async (req: Request, res: Response, next: NextFunction) => {
   const following = await prisma.user.findMany({
      where: {
         followers: {
            some: {
               followingId: (req as any).currentUser.id,
            },
         },
      },
   });

   res.status(200).json({ following });
};

export const getAllFollowersHandler = async (req: Request, res: Response, next: NextFunction) => {
   const followers = await prisma.user.findMany({
      where: {
         following: {
            some: {
               followerId: (req as any).currentUser.id,
            },
         },
      },
   });
   res.status(200).json({ followers });
};
