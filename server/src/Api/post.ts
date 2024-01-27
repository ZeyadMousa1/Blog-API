import { Post, User } from '@prisma/client';

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

export interface updatePostRequestParam {
   id: string;
}
export type updatePostRequest = Pick<
   Post,
   'category' | 'description' | 'image' | 'imagePublicId' | 'title'
>;

export interface updatePostResponse {
   message: string;
   post: Post;
}
