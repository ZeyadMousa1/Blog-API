import express from 'express';
import dotenv from 'dotenv';
// import xss from 'xss-clean'
import rateLimiting from 'express-rate-limit';

import { errorHandler, notFound } from '../shared/middelwares/error.handling';
import { appRouter } from '../modules/routes';

dotenv.config();
const app = express();

app.use(express.json());

app.use(
   rateLimiting({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 150,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests, please try again in 10 minutes',
   })
);

appRouter(app);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
   console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
});
