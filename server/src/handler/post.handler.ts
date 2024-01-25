import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { ExpressHandler } from '../utils/types';
import { createPostValidation } from '../validator/post.validator';
import {
   createPostRequest,
   createPostResponse,
   deletePostRequest,
   deletePostResponse,
   getAllPostsRequestQuery,
   getAllPostsResponse,
   getSinglePostRequest,
   getSinglePostResponse,
} from '../api/post';
import { cloudinaryRemoveImage, cloudinaryUploadImage } from '../utils/cloudinary';

const prisma = new PrismaClient();

/**
 * @desc    Create New Post
 * @route   /api/posts
 * @method  POST
 * @access private (only loggedin users himself)
 */
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

/**
 * @desc    Get All Posts
 * @route   /api/posts
 * @method  GET
 * @access public
 */
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

/**
 * @desc    Get Single Post
 * @route   /api/posts/:id
 * @method  GET
 * @access public
 */
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

/**
 * @desc    Delete Post
 * @route   /api/posts/:id
 * @method  DELETE
 * @access private (only admin or owner of the post)
 */
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
