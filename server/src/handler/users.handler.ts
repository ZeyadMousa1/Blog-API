import { Prisma, PrismaClient, User } from '@prisma/client';
import { ExpressHandler } from '../utils/types';
import {
   GetAllUsersResponse,
   GetUserResponse,
   GetUserRequest,
   UpdateUserRequest,
   UpdateUserResponse,
   UpdateUserRequestParams,
   GetUsersCountRsponse,
} from '../Api/users';
import { validateUpdateUser } from '../validator/user.validate';
import { PasswordServices } from '../utils/passwordService';
import { has } from 'lodash';

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
export const getUserHandler: ExpressHandler<GetUserRequest, {}, GetUserResponse, {}> = async (
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

/**
 * @desc Update User Profile
 * @route /api/users/profile/{id}
 * @method PUT
 * @access private (only himself)
 */
export const updateUserProfileHandler: ExpressHandler<
   UpdateUserRequestParams,
   UpdateUserRequest,
   UpdateUserResponse,
   {}
> = async (req, res, next) => {
   const { error } = validateUpdateUser(req.body);
   if (error) {
      return res.status(400).json({ error: error.details[0].message });
   }
   const { id } = req.params;
   const { bio, username, password } = req.body;
   let hashedPassword;
   if (!id) {
      return res.status(400).json({ error: 'not found this user' });
   }
   if (password) {
      hashedPassword = await PasswordServices.hashPassword(password);
   }
   const user = await prisma.user.update({
      where: {
         id,
      },
      data: {
         bio,
         username,
         password: hashedPassword,
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
   return res.status(201).json({ user });
};

/**
 * @desc    Get Users Count
 * @route   /api/users/count
 * @method  GET
 * @access private (only admin)
 */
export const getUsersCountHandler: ExpressHandler<{}, {}, GetUsersCountRsponse, {}> = async (
   req,
   res,
   next
) => {
   const count = await prisma.user.count();
   return res.status(201).json({ count });
};
