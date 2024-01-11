import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';

dotenv.config();
const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);

app.listen(process.env.PORT, () => {
   console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
});
