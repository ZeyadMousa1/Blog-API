import express from 'express';
import dotenv from 'dotenv';

import { errorHandler, notFound } from '../shared/middelwares/error.handling';
import { appRouter } from '../modules/routes';

dotenv.config();
const app = express();

app.use(express.json());

appRouter(app);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
   console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
});
