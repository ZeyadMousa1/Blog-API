import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../utils/ApiError';
import { Status } from '../utils/types';

const prisma = new PrismaClient();

export const FollowOrUnFollowHandler = async (req: Request, res: Response, next: NextFunction) => {
   const { followerId } = req.params;

   const follower = await prisma.user.findUnique({
      where: {
         id: followerId,
      },
   });
   if (!follower) {
      next(createError('user not found', 404, Status.FAIL));
   }
   const existingRelationship = await prisma.relationship.findFirst({
      where: {
         followerId,
         followingId: (req as any).currentUser.id,
      },
   });

   if ((req as any).currentUser.id === followerId) {
      res.status(401).json({ message: 'cant be follow your self' });
      return;
   }

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
            followerId: followerId,
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
