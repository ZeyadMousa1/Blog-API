import express from 'express';
import asyncHandler from 'express-async-handler';
import { signUpHandler } from '../handler/auth.handlre';

export const authRouter = express.Router();

authRouter.route('/register').post(asyncHandler(signUpHandler));
