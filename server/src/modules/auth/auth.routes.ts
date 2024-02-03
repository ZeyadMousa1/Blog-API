import express from 'express';
import asyncHandler from 'express-async-handler';
import {
   forgetPassword,
   resetPasswordHandler,
   signInHandler,
   signUpHandler,
   verifyEmailToken,
} from './auth.handler';

export const authRouter = express.Router();

authRouter.route('/signup').post(asyncHandler(signUpHandler));
authRouter.route('/signin').post(asyncHandler(signInHandler));
authRouter.route('/:id/verify').get(asyncHandler(verifyEmailToken));
authRouter.route('/forgetPassword').get(asyncHandler(forgetPassword));
authRouter.route('/resetPassword/:token').patch(asyncHandler(resetPasswordHandler));
