import express from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/users.routes';
import { errorHandler, notFound } from './middelwares/handleError';
import { postRouter } from './routes/post.routes';
import { commentRouter } from './routes/comment.routes';
import { categoryRouter } from './routes/category.routes';

dotenv.config();
const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comment', commentRouter);
app.use('/api/category', categoryRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
   console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
});
