import fs from 'fs';
import path from 'path';
import { Post, Prisma, PrismaClient } from '@prisma/client';
import { ExpressHandler } from '../utils/types';
import { createPostValidation } from '../validator/post.validator';
import { createPostRequest, createPostResponse } from '../api/post';
import { cloudinaryUploadImage } from '../utils/cloudinary';

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
