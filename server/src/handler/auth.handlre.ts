import { Prisma, PrismaClient } from '@prisma/client';
import { ExpressHandler } from '../utils/types';
import { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from '../Api/auth';
import { validateSignUpUser, validateSignInUser } from '../validator/auth.validator';
import { PasswordServices } from '../utils/passwordService';
import { generateJwtToken } from '../utils/auth';

const prisma = new PrismaClient();

/**
 * @desc Reqitser New User
 * @route /api/auth/signup
 * @method POST
 * @access public
 */
export const signUpHandler: ExpressHandler<{}, SignUpRequest, SignUpResponse, {}> = async (
   req,
   res,
   next
) => {
   const { error } = validateSignUpUser(req.body);
   if (error) {
      return res.status(400).json({ error: error.details[0].message });
   }
   const { email, username, password } = req.body;
   const existing = await prisma.user.findUnique({
      where: {
         email,
      },
   });
   if (existing) {
      return res.status(400).json({ error: 'this user already exist' });
   }
   if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
   }
   const hashedPassword = await PasswordServices.hashPassword(password!);
   const user: Prisma.UserCreateInput = {
      username,
      email,
      password: hashedPassword,
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
export const signInHandler: ExpressHandler<{}, SignInRequest, SignInResponse, {}> = async (
   req,
   res,
   next
) => {
   const { error } = validateSignInUser(req.body);
   if (error) {
      return res.status(400).json({ error: error.details[0].message });
   }
   const { email, password } = req.body;
   const existing = await prisma.user.findUnique({
      where: {
         email,
      },
   });
   if (!existing) {
      return res.status(400).json({ error: 'Invalid email or password' });
   }
   if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
   }
   const matchPassword = await PasswordServices.comparePassword(password, existing.password);
   if (!matchPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
   }
   const token = generateJwtToken({ id: existing.id, isAdmin: existing.isAdmin });
   return res.status(201).json({
      user: {
         id: existing.id,
         profilePhoto: existing.profilePhoto,
         isAdmin: existing.isAdmin,
      },
      token,
   });
};
