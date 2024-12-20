import express, { Express, Request, Response } from 'express';
// import dotenv from 'dotenv';
import cors from 'cors';
import v1Router from './v1/server';

import { ConnectToDB } from './db/setup';
import { createIndex } from './open-search/client';

// Load environment variables
// dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

//connect to DB
ConnectToDB()
createIndex()

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



// Welcome Route
// @ts-ignore
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the API' });
});

//v1 routes
app.use("/api/v1", v1Router)

// Start server
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;