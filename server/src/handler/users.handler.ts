import { Prisma, PrismaClient, User } from '@prisma/client';
import { ExpressHandler } from '../utils/types';
import { GetAllUsersResponse, GetUSerResponse, GetUserRequest } from '../Api/users';

const prisma = new PrismaClient();

/**
 * @desc    Get All Users Profile
 * @route   /api/users/profile
 * @method  GET
 * @access private (only admin)
 */
export const getAllUsersHandler: ExpressHandler<{}, {}, GetAllUsersResponse, {}> = async (
   req,
   res,
   next
) => {
   const users = await prisma.user.findMany({
      select: {
         id: true,
         email: true,
         username: true,
         bio: true,
         profilePhoto: true,
         isAdmin: true,
         isAccountVerified: true,
         createdAt: true,
         updatedAt: true,
      },
   });
   return res.status(201).json({ users });
};

/**
 * @desc Get User Profile
 * @route /api/users/profile/{id}
 * @method GET
 * @access public
 */
export const getUserHandler: ExpressHandler<GetUserRequest, {}, GetUSerResponse, {}> = async (
   req,
   res,
   next
) => {
   const { id } = req.params;
   const user = await prisma.user.findUnique({
      where: {
         id,
      },
      select: {
         id: true,
         email: true,
         username: true,
         bio: true,
         profilePhoto: true,
         isAdmin: true,
         isAccountVerified: true,
         createdAt: true,
         updatedAt: true,
      },
   });
   if (!user) {
      return res.status(400).json({ error: 'not found this user' });
   }
   res.status(201).json({ user });
};
