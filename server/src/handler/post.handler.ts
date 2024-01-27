import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { ExpressHandler } from '../utils/types';
import { createPostValidation, updatePostValidation } from '../validator/post.validator';
import {
   createPostRequest,
   createPostResponse,
   deletePostRequest,
   deletePostResponse,
   getAllPostsRequestQuery,
   getAllPostsResponse,
   getSinglePostRequest,
   getSinglePostResponse,
   updatePostRequest,
   updatePostRequestParam,
   updatePostResponse,
} from '../api/post';
import { cloudinaryRemoveImage, cloudinaryUploadImage } from '../utils/cloudinary';
import { Response, Request, NextFunction } from 'express';

const prisma = new PrismaClient();

export const createPostHandler: ExpressHandler<
   {},
   createPostRequest,
   createPostResponse,
   {}
> = async (req, res, next) => {
   const { title, description, category } = req.body;
   const { error } = createPostValidation(req.body);
   if (error) {
      return res.status(400).json({ error: error.details[0].message });
   }
   if (!title || !description || !category) {
      return res.status(400).json({ error: 'all fields are required' });
   }
   const imagePath = path.join(__dirname, `../images/${req.file?.filename}`);
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
};

export const getAllPostsHandler: ExpressHandler<
   {},
   {},
   getAllPostsResponse,
   getAllPostsRequestQuery
> = async (req, res, next) => {
   const { category, pageNumber } = req.query;
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
         orderBy: {
            createdAt: 'desc',
         },
         include: {
            user: {
               select: userSelected,
            },
         },
      });
   } else if (category) {
      posts = await prisma.post.findMany({
         orderBy: {
            createdAt: 'desc',
         },
         where: {
            category,
         },
         include: {
            user: {
               select: userSelected,
            },
         },
      });
   } else {
      posts = await prisma.post.findMany({
         orderBy: {
            createdAt: 'desc',
         },
         include: {
            user: {
               select: userSelected,
            },
         },
      });
   }

   res.status(201).json({
      result: posts.length,
      posts,
   });
};

export const getSinglePostHandler: ExpressHandler<
   getSinglePostRequest,
   {},
   getSinglePostResponse,
   {}
> = async (req, res, next) => {
   const { id } = req.params;
   const post = await prisma.post.findUnique({
      where: {
         id,
      },
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
      },
   });
   if (!post) {
      return res.status(404).json({ error: 'post not found' });
   }
   res.status(201).json({ post });
};

export const deletePostHandler: ExpressHandler<
   deletePostRequest,
   {},
   deletePostResponse,
   {}
> = async (req, res, next) => {
   const { id } = req.params;
   const post = await prisma.post.findUnique({
      where: {
         id,
      },
   });
   if (!post) {
      return res.status(404).json({ error: 'post not found' });
   }

   if ((req as any).currentUser.isAdmin || (req as any).currentUser.id === post.userId) {
      await prisma.post.delete({
         where: {
            id,
         },
      });
      await cloudinaryRemoveImage(post.imagePublicId!);
      // @TODO: Delete all comments for this post
      res.status(200).json({
         messgae: 'post has been deleted successfully',
         id: post.id,
      });
   } else {
      res.status(403).json({ error: 'access denied, forbidden' });
   }
};

export async function updatePostHandler(req: Request, res: Response, next: NextFunction) {
   const { id } = req.params;
   const { title, category, description, image, imagePublicId } = req.body;
   const { error } = updatePostValidation(req.body);
   if (error) {
      res.status(400).json({ error: error.details[0].message });
   }
   const post = await prisma.post.findUnique({
      where: {
         id,
      },
   });
   if (!post) {
      res.status(404).json({ error: 'post not found' });
   }
   if ((req as any).currentUser.id === post?.userId) {
      const postUp = await prisma.post.update({
         where: {
            id,
         },
         data: {
            title,
            category,
            description,
            image,
            imagePublicId,
         },
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
         },
      });
      res.status(200).json({
         message: 'post success updated',
         post: postUp,
      });
   } else {
      res.status(403).json({ error: 'access denied, forbidden' });
   }
}
// export const updatePostHandler: ExpressHandler<
//    updatePostRequestParam,
//    updatePostRequest,
//    updatePostResponse,
//    {}
// > = async (req, res, next) => {
//    const { id } = req.params;
//    const { title, category, description, image, imagePublicId } = req.body;
//    const { error } = updatePostValidation(req.body);
//    if (error) {
//       res.status(400).json({ error: error.details[0].message });
//    }
//    const post = await prisma.post.findUnique({
//       where: {
//          id,
//       },
//    });
//    if (!post) {
//       res.status(404).json({ error: 'post not found' });
//    }
//    if ((req as any).currentUser.id === post?.userId) {
//       const postUp = await prisma.post.update({
//          where: {
//             id,
//          },
//          data: {
//             title,
//             category,
//             description,
//             image,
//             imagePublicId,
//          },
//          include: {
//             user: {
//                select: {
//                   id: true,
//                   username: true,
//                   email: true,
//                   profilePhoto: true,
//                   isAdmin: true,
//                   isAccountVerified: true,
//                },
//             },
//          },
//       });
//       res.status(200).json({
//          message: 'post success updated',
//          post: postUp,
//       });
//    } else {
//       res.status(403).json({ error: 'access denied, forbidden' });
//    }
// };

export async function updatePostImage(req: Request, res: Response, next: NextFunction) {
   const { id } = req.params;
   if (!req.file) {
      res.status(400).json({ messag: 'no image provider' });
   }
   const post = await prisma.post.findUnique({
      where: {
         id,
      },
   });
   if (!post) {
      res.status(404).json({ message: 'post not found' });
   }
   if ((req as any).currentUser.id === post?.userId) {
      await cloudinaryRemoveImage(post?.imagePublicId!);
      const imagePath = path.join(__dirname, `../images/${req.file?.filename}`);
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
      res.status(403).json({ error: 'access denied, forbidden' });
   }
}
