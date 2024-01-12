import { Prisma, PrismaClient, User } from '@prisma/client';
import { ExpressHandler } from '../utils/types';
import { GetAllUsersResponse } from '../Api/users';

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
   const users = await prisma.user.findMany({});
   return res.status(201).json({ users });
};
