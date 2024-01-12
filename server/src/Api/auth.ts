import { User } from '@prisma/client';

export type SignUpRequest = Pick<User, 'username' | 'email' | 'password'>;
export interface SignUpResponse {
   message: string;
}

export type SignInRequest = Pick<User, 'email' | 'password'>;
export interface SignInResponse {
   user: Pick<User, 'id' | 'isAdmin' | 'profilePhoto'>;
   token: string;
}
