import { Prisma, PrismaClient } from '@prisma/client';
import { ExpressHandler } from '../utils/types';
import { SignUpRequest, SignUpResponse } from '../Api/auth';
import { ValidateRegistreUser } from '../validator/auth.validator';
import { PasswordServices } from '../utils/passwordService';

const prisma = new PrismaClient();

/**
 * @desc Reqitser New User
 * @router /api/auth/register
 * @method POST
 * @access public
 */

export const signUpHandler: ExpressHandler<{}, SignUpRequest, SignUpResponse, {}> = async (
   req,
   res,
   next
) => {
   const { error } = ValidateRegistreUser(req.body);
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
