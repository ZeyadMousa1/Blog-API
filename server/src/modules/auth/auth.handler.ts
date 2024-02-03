import { PrismaClient } from '@prisma/client';
import { Status } from '../../shared/utils/types';
import { validateSignUpUser, validateSignInUser, validateEmail } from './auth.validator';
import { PasswordServices } from '../../shared/utils/passwordService';
import { generateJwtToken } from '../../shared/utils/auth';
import { createError } from '../../shared/utils/ApiError';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { sendEmail } from '../../shared/utils/email';
import { verifyEmail } from '../../shared/utils/verifyEmail.templates';

const prisma = new PrismaClient();

/**
 * @desc Reqitser New User
 * @route /api/auth/signup
 * @method POST
 * @access public
 */
export const signUpHandler = async (req: Request, res: Response, next: NextFunction) => {
   const { error } = validateSignUpUser(req.body);
   if (error) next(createError(`${error.details[0].message}`, 404, Status.ERROR));

   const { email, username, password } = req.body;
   const existing = await prisma.user.findUnique({
      where: {
         email,
      },
   });
   if (existing) next(createError('this user already exist', 400, Status.FAIL));

   if (!username || !email || !password)
      next(createError('All fields are required', 400, Status.FAIL));

   const hashedPassword = await PasswordServices.hashPassword(password!);

   const user = await prisma.user.create({
      data: {
         username,
         email,
         password: hashedPassword,
         bio: '',
         photoPublicId: '',
         emailVerificationToken: crypto.randomBytes(32).toString(),
      },
   });

   await sendEmail(
      user.email,
      'Verify your email',
      verifyEmail(user.emailVerificationToken!, user.id)
   );

   res.status(201).json({ message: 'We sent to you an email, please verify your email' });
};

/**
 * @desc  Login User
 * @route /api/auth/signin
 * @method POST
 * @access public
 */
export const signInHandler = async (req: Request, res: Response, next: NextFunction) => {
   const { error } = validateSignInUser(req.body);
   if (error) next(createError(`${error.details[0].message}`, 404, Status.ERROR));

   const { email, password } = req.body;
   const existing = await prisma.user.findUnique({
      where: {
         email,
      },
   });
   if (!existing) return next(createError('Invalid email or password', 401, Status.FAIL));

   if (!email || !password) return next(createError('All fields are required', 400, Status.FAIL));

   const matchPassword = await PasswordServices.comparePassword(password, existing.password);
   if (!matchPassword) return next(createError('Invalid email or password', 400, Status.FAIL));

   if (!existing.isAccountVerified) {
      return next(
         createError('we sent to you an email, please verify your email address', 400, Status.FAIL)
      );
   }

   const token = generateJwtToken({ id: existing.id, isAdmin: existing.isAdmin });
   res.status(201).json({
      user: {
         id: existing.id,
         profilePhoto: existing.profilePhoto,
         isAdmin: existing.isAdmin,
      },
      token,
   });
};

export const verifyEmailToken = async (req: Request, res: Response, next: NextFunction) => {
   const user = await prisma.user.update({
      where: {
         id: req.params.id,
      },
      data: {
         isAccountVerified: true,
         emailVerificationToken: null,
      },
   });
   if (!user) return next(createError('Invalid Token', 404, Status.FAIL));
};

export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
   const { error } = validateEmail(req.body);
   if (error) return next(createError(`${error.details[0].message}`, 404, Status.ERROR));

   const { email } = req.body;

   const user = await prisma.user.findFirst({
      where: {
         email,
      },
   });

   if (!user) return next(createError('User not found', 401, Status.FAIL));

   const PasswordResetToken = crypto.randomBytes(32).toString('hex');
   crypto.createHash('sha256').update(PasswordResetToken).digest('hex');
   const PasswordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

   await prisma.user.update({
      where: {
         id: user.id,
      },
      data: {
         PasswordResetToken,
         PasswordResetTokenExpires,
      },
   });

   const resetUrl = `${process.env.BASE_URL}/api/auth/resetPassword/${PasswordResetToken}`;
   const message = `We have a received a password reset request. Please use the below link to reset you password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes`;
   await sendEmail(user.email, 'Password change request received', message);

   res.status(200).json({
      message: 'We sent to you an email, please verify your email',
   });
};

export const resetPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
   const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
   const user = await prisma.user.findFirst({
      where: {
         PasswordResetToken: req.params.token,
         PasswordResetTokenExpires: {
            gt: new Date().toISOString(),
         },
      },
   });
   if (!user) {
      return next(createError('Token is invalid or expired', 404, Status.FAIL));
   }

   const { password } = req.body;
   const hashedPassword = await PasswordServices.hashPassword(password);

   await prisma.user.update({
      where: {
         id: user.id,
      },
      data: {
         password: hashedPassword,
         PasswordResetToken: null,
         PasswordResetTokenExpires: null,
      },
   });

   const loginToken = generateJwtToken({ id: user.id, isAdmin: user.isAdmin });
   res.status(201).json({
      user: {
         id: user.id,
         profilePhoto: user.profilePhoto,
         isAdmin: user.isAdmin,
      },
      loginToken,
   });
};
