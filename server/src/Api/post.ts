import { Post } from '@prisma/client';

export type createPostRequest = Pick<Post, 'title' | 'description' | 'category'>;
export interface createPostResponse {
   message: string;
   post: Post;
}

export interface getAllPostsRequestQuery {
   pageNumber: number;
   category: string;
}
export interface getAllPostsResponse {
   posts: Post[];
   result: number;
}

export interface getSinglePostRequest {
   id: string;
}
export interface getSinglePostResponse {
   post: Post;
}

export interface deletePostRequest {
   id: string;
}
export interface deletePostResponse {
   messgae: string;
   id: string;
}
