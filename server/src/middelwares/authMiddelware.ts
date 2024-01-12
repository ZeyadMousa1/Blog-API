import { verifyJwt } from '../utils/auth';
import { ExpressHandler } from '../utils/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authMiddelware: ExpressHandler<{}, {}, {}, {}> = async (req, res, next) => {
   const token = req.headers.authorization?.split(' ')[1];
   if (!token) {
      return res.status(401).json({ error: 'Token is required' });
   }
   try {
      const payLoad = verifyJwt(token);
      const currentUser = await prisma.user.findUnique({
         where: {
            id: payLoad.id,
         },
      });
      if (!currentUser) {
         return res.status(401).json({ error: 'User not found' });
      }
      (req as any).currentUser = currentUser;
      next();
   } catch (err) {
      res.status(401).send({ error: 'Bad token' });
   }
};

// just check is admin
export const isAdminRole: ExpressHandler<{}, {}, {}, {}> = (req, res, next) => {
   if (!(req as any).currentUser.isAdmin) {
      return res.status(403).json({ error: 'not allowed, only admin' });
   }
   next();
};

// verify token and check is admin
export const authMiddelwareAndIsAdminRole: ExpressHandler<{}, {}, {}, {}> = (req, res, next) => {
   authMiddelware(req, res, () => {
      if (!(req as any).currentUser.isAdmin) {
         return res.status(403).json({ error: 'not allowed, only admin' });
      }
      next();
   });
};
