import express, { Request, Response } from 'express'
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
