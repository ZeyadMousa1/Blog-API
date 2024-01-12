import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/users.routes';
import { errorHandler, notFound } from './middelwares/errorMeiddelware';

dotenv.config();
const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
   console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
});
