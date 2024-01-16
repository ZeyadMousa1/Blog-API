import { Post } from '@prisma/client';

export type createPostRequest = Pick<Post, 'title' | 'description' | 'category'>;
export interface createPostResponse {
   message: string;
   post: Post;
}
