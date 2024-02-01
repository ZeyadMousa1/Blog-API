import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { createPostValidation, updatePostValidation } from './post.validator';
import { cloudinaryUploadImage, cloudinaryRemoveImage } from '../../shared/utils/cloudinary';
import { Response, Request, NextFunction } from 'express';
import { createError } from '../../shared/utils/ApiError';
import { Status } from '../../shared/utils/types';

const prisma = new PrismaClient();

export async function createPostHandler(req: Request, res: Response, next: NextFunction) {
   const { error } = createPostValidation(req.body);
   if (error) return next(createError(`${error.details[0].message}`, 404, Status.ERROR));

   const { title, description, category } = req.body;

   const imagePath = path.join(__dirname, `../../images/${req.file?.filename}`);
   const result = await cloudinaryUploadImage(imagePath);
   const post = await prisma.post.create({
      data: {
         title,
         description,
         category,
         image: (result as any).secure_url,
         imagePublicId: (result as any).public_id,
         userId: (req as any).currentUser.id,
      },
   });

   res.status(201).json({
      message: 'create post successfully',
      post,
   });
   fs.unlinkSync(imagePath);
}

export async function getAllPostsHandler(req: Request, res: Response, next: NextFunction) {
   const { category, pageNumber }: any = req.query;
   const POST_PER_PAGE = 3;

   let posts;

   const userSelected = {
      id: true,
      username: true,
      email: true,
      profilePhoto: true,
      isAdmin: true,
      isAccountVerified: true,
   };

   if (pageNumber) {
      posts = await prisma.post.findMany({
         skip: (pageNumber - 1) * POST_PER_PAGE,
         take: POST_PER_PAGE,
         orderBy: { createdAt: 'desc' },
         include: {
            user: { select: userSelected },
            likedBy: {
               select: {
                  userId: true,
               },
            },
            comments: true,
         },
      });
   } else if (category) {
      posts = await prisma.post.findMany({
         orderBy: { createdAt: 'desc' },
         where: { category },
         include: {
            user: { select: userSelected },
            _count: {
               select: {
                  likedBy: true,
               },
            },
            likedBy: {
               select: {
                  userId: true,
               },
            },
            comments: true,
         },
      });
   } else {
      posts = await prisma.post.findMany({
         orderBy: { createdAt: 'desc' },
         include: {
            user: {
               select: userSelected,
            },
            likedBy: {
               select: {
                  userId: true,
               },
            },
            comments: true,
         },
      });
   }

   res.status(201).json({
      result: posts.length,
      posts,
   });
}

export async function getSinglePostHandler(req: Request, res: Response, next: NextFunction) {
   const { id } = req.params;
   const post = await prisma.post.findUnique({
      where: { id },
      include: {
         user: {
            select: {
               id: true,
               username: true,
               email: true,
               profilePhoto: true,
               isAdmin: true,
               isAccountVerified: true,
            },
         },
         likedBy: {
            select: {
               userId: true,
            },
         },
         comments: true,
      },
   });
   if (!post) return next(createError('Post not found', 404, Status.FAIL));
   res.status(201).json({ post });
}

export async function deletePostHandler(req: Request, res: Response, next: NextFunction) {
   const { id } = req.params;
   const post = await prisma.post.findUnique({
      where: {
         id,
      },
   });
   if (!post) return next(createError('Post not found', 404, Status.FAIL));

   if ((req as any).currentUser.isAdmin || (req as any).currentUser.id === post?.id) {
      await prisma.post.delete({
         where: {
            id,
         },
      });
      await cloudinaryRemoveImage(post?.imagePublicId!);
      await prisma.comment.deleteMany({
         where: {
            postId: id,
         },
      });
      res.status(200).json({
         messgae: 'post has been deleted successfully',
         id: post?.id,
      });
   } else {
      return next(createError('access denied, forbidden', 403, Status.FAIL));
   }
}

export async function updatePostHandler(req: Request, res: Response, next: NextFunction) {
   const { error } = updatePostValidation(req.body);
   if (error) return next(createError(`${error.details[0].message}`, 404, Status.ERROR));

   const { id } = req.params;
   const { title, category, description } = req.body;
   const post = await prisma.post.findUnique({
      where: {
         id,
      },
   });
   if (!post) return next(createError('Post not found', 404, Status.FAIL));

   if ((req as any).currentUser.id === post?.userId) {
      const postUp = await prisma.post.update({
         where: { id },
         data: { title, category, description },
      });
      res.status(200).json({
         message: 'post success updated',
         post: postUp,
      });
   } else {
      return next(createError('access denied, forbidden', 403, Status.FAIL));
   }
}

export async function updatePostImageHandler(req: Request, res: Response, next: NextFunction) {
   const { id } = req.params;
   if (!req.file) return next(createError('no image provider', 404, Status.FAIL));

   const post = await prisma.post.findUnique({
      where: {
         id,
      },
   });
   if (!post) return next(createError('Post not found', 404, Status.FAIL));

   if ((req as any).currentUser.id === post?.userId) {
      await cloudinaryRemoveImage(post?.imagePublicId!);
      const imagePath = path.join(__dirname, `../../images/${req.file?.filename}`);
      const result = await cloudinaryUploadImage(imagePath);
      const imgUp = await prisma.post.update({
         where: {
            id,
         },
         data: {
            imagePublicId: (result as any).public_id,
            image: (result as any).secure_url,
         },
      });
      res.status(200).json({
         message: 'post image success updated',
         imgUp,
      });
      fs.unlinkSync(imagePath);
   } else {
      return next(createError('access denied, forbidden', 403, Status.FAIL));
   }
}

export async function searchPosts(req: Request, res: Response, next: NextFunction) {
   const { title } = req.query;
   if (title) {
      const posts = await prisma.post.findMany({
         where: {
            title: {
               contains: title.toString(),
            },
         },
      });
      res.status(200).json({ posts });
   } else {
      res.status(200).json({});
   }
}
