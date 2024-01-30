import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { validateCreateCategory } from './category.validator';
import { createError } from '../../shared/utils/ApiError';
import { Status } from '../../shared/utils/types';

const prisma = new PrismaClient();

// only admin
export async function createCategoryHandler(req: Request, res: Response, next: NextFunction) {
   const { error } = validateCreateCategory(req.body);
   if (error) return next(createError(`${error.details[0].message}`, 404, Status.ERROR));
   const { title } = req.body;

   const category = await prisma.category.create({
      data: {
         title,
         userId: (req as any).currentUser.id,
      },
   });
   res.status(200).json({ category });
}

export async function getAllCategoryHandler(req: Request, res: Response, next: NextFunction) {
   const categories = await prisma.category.findMany({});
   res.status(200).json({ categories });
}

// only admin
export async function deleteCategoryHandler(req: Request, res: Response, next: NextFunction) {
   const { id } = req.params;
   const category = await prisma.category.findUnique({
      where: {
         id,
      },
   });
   if (!category) return next(createError('Category not found', 404, Status.ERROR));
   await prisma.category.delete({
      where: {
         id,
      },
   });
   res.status(200).json({ message: 'category deleted successfully' });
}
