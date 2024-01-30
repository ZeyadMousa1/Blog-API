import { PrismaClient } from '@prisma/client';
import { ExpressHandler, Status } from '../../shared/utils/types';
import {
   GetAllUsersResponse,
   UpdateUserRequest,
   UpdateUserResponse,
   UpdateUserRequestParams,
   GetUsersCountRsponse,
   ProfilePhotoUploadResponse,
   ProfilePhotoUploadRequest,
   DeleteProfileRequestParam,
   DeleteProfileResponse,
} from '../../api/users';
import { validateUpdateUser } from './user.validate';
import { PasswordServices } from '../../shared/utils/passwordService';
import path from 'path';
import {
   cloudinaryUploadImage,
   cloudinaryRemoveImage,
   cloudinaryRemoveMultipleImage,
} from '../../shared/utils/cloudinary';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { createError } from '../../shared/utils/ApiError';

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
         posts: {
            include: {
               likedBy: {
                  select: {
                     userId: true,
                  },
               },
               comments: true,
            },
         },
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
export async function getUserProfileHandler(req: Request, res: Response, next: NextFunction) {
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
         posts: {
            include: {
               likedBy: {
                  select: {
                     userId: true,
                  },
               },
               comments: true,
            },
         },
      },
   });

   if (!user) return next(createError('User not Found', 404, Status.FAIL));
   res.status(201).json({
      user,
   });
}

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
   if (error) return next(createError(`${error.details[0].message}`, 404, Status.ERROR));

   const { id } = req.params;
   const { bio, username, password } = req.body;
   let hashedPassword;
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
   if (!user) return next(createError('User not Found', 404, Status.FAIL));
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

/**
 * @desc    Profile Photo Upload
 * @route   /api/users/profile/profile-photo-upload
 * @method  POST
 * @access private (only logged in users)
 */

export const profilePhotoUploadHandler: ExpressHandler<
   {},
   ProfilePhotoUploadRequest,
   ProfilePhotoUploadResponse,
   {}
> = async (req, res, next) => {
   if (!req.file) return next(createError('No file provider', 404, Status.FAIL));

   const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
   const result = await cloudinaryUploadImage(imagePath);
   console.log(result);
   const user = await prisma.user.findUnique({
      where: {
         id: (req as any).currentUser.id,
      },
   });
   if (user?.photoPublicId !== '') {
      await cloudinaryRemoveImage(user?.photoPublicId!);
   }
   if (result) {
      user!.profilePhoto = (result as any).secure_url;
      user!.photoPublicId = (result as any).public_id;
   }
   await prisma.user.update({
      where: {
         id: user?.id,
      },
      data: {
         profilePhoto: user?.profilePhoto,
         photoPublicId: user?.photoPublicId,
      },
   });
   res.status(201).json({
      message: 'your profile photo upload successfully',
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
   });
   fs.unlinkSync(imagePath);
};

/**
 * @desc    Delete User Account
 * @route   /api/users/profile/:id
 * @method  DELETE
 * @access private (only admin or user him self)
 */

export const deleteProfile: ExpressHandler<
   DeleteProfileRequestParam,
   {},
   DeleteProfileResponse,
   {}
> = async (req, res, next) => {
   const { id } = req.params;
   const user = await prisma.user.findUnique({
      where: {
         id,
      },
   });
   if (!user) return next(createError('User not Found', 404, Status.FAIL));

   await cloudinaryRemoveImage(user.photoPublicId);

   const posts = await prisma.post.findMany({
      where: {
         userId: id,
      },
   });
   const publicIds = posts?.map(post => post.imagePublicId!);
   if (publicIds?.length > 0) await cloudinaryRemoveMultipleImage(publicIds);

   await prisma.like.deleteMany({
      where: {
         userId: id,
      },
   });

   await prisma.post.deleteMany({
      where: {
         userId: id,
      },
   });

   await prisma.comment.deleteMany({
      where: {
         userId: id,
      },
   });

   await prisma.user.delete({
      where: {
         id,
      },
   });

   res.status(201).json({ message: 'your profile has been deleted' });
};
