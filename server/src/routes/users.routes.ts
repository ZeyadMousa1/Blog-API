import express from 'express';
import asyncHandler from 'express-async-handler';
import { getAllUsersHandler } from '../handler/users.handler';
import {
   authMiddelware,
   authMiddelwareAndIsAdminRole,
   isAdminRole,
} from '../middelwares/authMiddelware';

export const userRouter = express.Router();

userRouter.route('/profile').get(authMiddelwareAndIsAdminRole, asyncHandler(getAllUsersHandler));
