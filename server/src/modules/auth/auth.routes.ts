import express from 'express';
import asyncHandler from 'express-async-handler';
import { signInHandler, signUpHandler, verifyEmailToken } from './auth.handler';

export const authRouter = express.Router();

authRouter.route('/signup').post(asyncHandler(signUpHandler));
authRouter.route('/signin').post(asyncHandler(signInHandler));
authRouter.route('/:id/verify').get(asyncHandler(verifyEmailToken));
