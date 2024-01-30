import { Prisma, PrismaClient } from '@prisma/client';
import { Status } from '../../shared/utils/types';
import { validateSignUpUser, validateSignInUser } from './auth.validator';
import { PasswordServices } from '../../shared/utils/passwordService';
import { generateJwtToken } from '../../shared/utils/auth';
import { createError } from '../../shared/utils/ApiError';
import { Request, Response, NextFunction } from 'express';

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
   const user: Prisma.UserCreateInput = {
      username,
      email,
      password: hashedPassword,
      bio: '',
      photoPublicId: '',
   };
   await prisma.user.create({
      data: user,
   });
   res.status(201).json({ message: 'your reqgisterd successfully, please login' });
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
