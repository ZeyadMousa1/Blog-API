import express from 'express';
import { authRouter } from './auth/auth.routes';
import { postRouter } from './post/post.routes';
import { userRouter } from './user/users.routes';
import { commentRouter } from './comment/comment.routes';
import { relationshipRouter } from './follow/follow.routes';
import { categoryRouter } from './category/category.routes';
import { likeRouter } from './like/like.routes';
import { bookMarkingRouter } from './bookMarking/bookMarking.routes';

export const appRouter = (app: express.Application) => {
   app.use('/api/v1/auth', authRouter);
   app.use('/api/v1/users', userRouter);
   app.use('/api/v1/posts', postRouter);
   app.use('/api/v1/comments', commentRouter);
   app.use('/api/v1/categories', categoryRouter);
   app.use('/api/v1/follow', relationshipRouter);
   app.use('/api/v1/likes', likeRouter);
   app.use('/api/v1/book-marks', bookMarkingRouter);
};
