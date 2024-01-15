import { User } from '@prisma/client';

export interface GetAllUsersResponse {
   users: Partial<User>[];
}

export interface GetUserRequest {
   id: string;
}
export interface GetUserResponse {
   user: Partial<User>;
}

export interface UpdateUserRequestParams {
   id: string;
}
export interface UpdateUserResponse {
   user: Partial<User>;
}
export type UpdateUserRequest = Pick<User, 'bio' | 'username' | 'password'>;

export interface GetUsersCountRsponse {
   count: number;
}

export interface ProfilePhotoUploadRequest {
   user: User;
}
export interface ProfilePhotoUploadResponse {
   message: string;
   url: string;
   publicId: string;
}

export interface DeleteProfileRequestParam {
   id: string;
}
export interface DeleteProfileResponse {
   message: string;
}
