import { NextFunction, Request, Response } from 'express-serve-static-core';
import { createError } from '../utils/ApiError';
import { verifyJwt } from '../utils/auth';
import { Status } from '../utils/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
   const token = req.headers.authorization?.split(' ')[1];
   if (!token) return next(createError('Token is required', 401, Status.FAIL));

   try {
      const payLoad = verifyJwt(token);
      const currentUser = await prisma.user.findUnique({
         where: {
            id: payLoad.id,
         },
      });
      if (!currentUser) {
         return next(createError('User not Found', 404, Status.FAIL));
      }
      (req as any).currentUser = currentUser;
      next();
   } catch (err) {
      next(createError('Bad Token', 401, Status.FAIL));
   }
};
