import { User } from '@prisma/client';

export interface GetAllUsersResponse {
   users: User[];
}
// export interface GetAllUserRequest {
//    currentUser: User;
// }
