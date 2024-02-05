import express from 'express';
import { authRouter } from './auth/auth.routes';
import { postRouter } from './post/post.routes';
import { userRouter } from './user/users.routes';
import { commentRouter } from './comment/comment.routes';
import { relationshipRouter } from './follow/relationship.routest';
import { categoryRouter } from './category/category.routes';
import { likeRouter } from './like/like.routes';
import { bookMarkingRouter } from './bookMarking/bookMarking.routes';

export const appRouter = (app: express.Application) => {
   app.use('/api/auth', authRouter);
   app.use('/api/users', userRouter);
   app.use('/api/posts', postRouter);
   app.use('/api/comments', commentRouter);
   app.use('/api/categories', categoryRouter);
   app.use('/api/follow', relationshipRouter);
   app.use('/api/likes', likeRouter);
   app.use('/api/book-marks', bookMarkingRouter);
};
