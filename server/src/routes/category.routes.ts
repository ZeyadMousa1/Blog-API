import express from 'express';
import asyncHandler from 'express-async-handler';
import { verifyTokeAndIsAdminRole } from '../middelwares/manageRoles';
import {
   createCategoryHandler,
   deleteCategoryHandler,
   getAllCategoryHandler,
} from '../handler/category.handler';

export const categoryRouter = express.Router();

categoryRouter
   .route('/')
   .post(verifyTokeAndIsAdminRole, asyncHandler(createCategoryHandler))
   .get(asyncHandler(getAllCategoryHandler));

categoryRouter.route('/:id').delete(verifyTokeAndIsAdminRole, asyncHandler(deleteCategoryHandler));
