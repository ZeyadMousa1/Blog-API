import { Prisma, PrismaClient } from '@prisma/client';
import { Status } from '../../shared/utils/types';
import { createUserValidate, updateUserVAlidate } from './user.validate';
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

export const createUserHandler = async (req: Request, res: Response, next: NextFunction) => {
   const { error } = createUserValidate(req.body);
   if (error) return next(createError(`${error.details[0].message}`, 404, Status.ERROR));

   const { username, email, password, isAdmin } = req.body;
   if (!username || !email || !password || !isAdmin)
      return next(createError('All fields are required', 401, Status.FAIL));

   const existing = await prisma.user.findUnique({
      where: {
         email,
      },
   });

   if (existing) return next(createError('this user already exist', 400, Status.FAIL));

   const hashedPassword = await PasswordServices.hashPassword(password);

   const newUser: Prisma.UserCreateInput = {
      email,
      password: hashedPassword,
      username,
      isAdmin,
      bio: '',
      photoPublicId: '',
   };
   await prisma.user.create({
      data: newUser,
   });
   res.status(201).json({ message: 'Account created successfully, please login' });
};

export const getAllUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
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
   res.status(201).json({ users });
};

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

export const updateUserProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
   const { error } = updateUserVAlidate(req.body);
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
   res.status(201).json({ user });
};

export const getUsersCountHandler = async (req: Request, res: Response, next: NextFunction) => {
   const count = await prisma.user.count();
   res.status(201).json({ count });
};

export const profilePhotoUploadHandler = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
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

export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
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

   await prisma.relationship.deleteMany({
      where: {
         OR: [{ followingId: id }, { followerId: id }],
      },
   });
   await prisma.postsBookMarking.deleteMany({
      where: {
         userId: id,
      },
   });
   await prisma.category.deleteMany({
      where: {
         userId: id,
      },
   });
   await prisma.like.deleteMany({
      where: {
         userId: id,
      },
   });
   await prisma.comment.deleteMany({
      where: {
         userId: id,
      },
   });
   await prisma.post.deleteMany({
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

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
   const { username, email } = req.query;

   if (username || email) {
      const users = await prisma.user.findMany({
         where: {
            username: {
               contains: username?.toString(),
            },
            email: {
               contains: email?.toString(),
            },
         },
      });
      res.status(200).json({ users });
   } else {
      res.status(200).json({});
   }
};
