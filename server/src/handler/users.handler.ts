import { PrismaClient } from '@prisma/client';
import { ExpressHandler } from '../utils/types';
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
} from '../api/users';
import { validateUpdateUser } from '../validator/user.validate';
import { PasswordServices } from '../utils/passwordService';
import path from 'path';
import { cloudinaryRemoveImage, cloudinaryUploadImage } from '../utils/cloudinary';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

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

   if (!user) {
      res.status(400).json({ error: 'not found this user' });
   }
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
   if (!req.file) {
      return res.status(401).json({ message: 'no file provided' });
   }
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
   if (!user) {
      return res.status(404).json({ error: 'User not found!' });
   }
   await cloudinaryRemoveImage(user.photoPublicId);
   // @TODO : Delete user posts and comment from db and delete user posts image from cloudinary
   await prisma.user.delete({
      where: {
         id,
      },
   });
   res.status(201).json({ message: 'your profile has been deleted' });
};
