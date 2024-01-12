import jwt from 'jsonwebtoken';
import { PayLoad } from './types';

export function generateJwtToken(payLoad: PayLoad): string {
   return jwt.sign(payLoad, getJwtSecret(), { expiresIn: '5d' });
}

function getJwtSecret(): string {
   const secret = process.env.JWT_SECRET;
   if (!secret) {
      console.log('Missing jwt secret');
      process.exit(1);
   }
   return secret;
}
