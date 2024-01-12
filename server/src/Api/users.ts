import { User } from '@prisma/client';

export interface GetAllUsersResponse {
   users: Partial<User>[];
}

export interface GetUserRequest {
   id: string;
}
export interface GetUSerResponse {
   user: Partial<User>;
}
