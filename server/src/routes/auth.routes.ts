import express from 'express';
import asyncHandler from 'express-async-handler';
import { signInHandler, signUpHandler } from '../handler/auth.handler';

export const authRouter = express.Router();

authRouter.route('/signup').post(asyncHandler(signUpHandler));
authRouter.route('/signin').post(asyncHandler(signInHandler));
