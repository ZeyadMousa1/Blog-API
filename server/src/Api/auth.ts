import { User } from '@prisma/client';

export type SignUpRequest = Pick<User, 'username' | 'email' | 'password'>;
export interface SignUpResponse {
   message: string;
}
