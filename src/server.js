import express from "express";
import cors from "cors";
import pino from 'pino-http';
import dotenv from 'dotenv';
import { env } from "./utils/env.js";
import router from './routers/index.js';
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import cookieParser from 'cookie-parser';


dotenv.config();
const PORT = Number(env("PORT", 3000));


export const setupServer = () => {
    const app = express();
    app.use(express.json());
    app.use(cors());

    app.use(
        pino({
          transport: {
            target: 'pino-pretty',
          },
        }),
    );

    app.use(router);

    app.use(notFoundHandler);
    app.use(errorHandler);
    app.use(cookieParser());


    app.listen(PORT, () => {
        console.log(`This server is running on PORT ${PORT}`);
    });
};


