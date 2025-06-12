import { config } from "dotenv";
import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import game from "./routes/game.js";
import user from "./routes/user.js";

config({
    path: "./data/config.env"
})


export const app = express();
app.use(express.json());


import cookieParser from "cookie-parser";
app.use(cookieParser());

import cors from "cors";
app.use(
    cors({
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      origin: true,
      // sameSite: 'none',
      // secure: true
    //   origin: [process.env.FRONTEND_URI_1, process.env.FRONTEND_URI_2],
    })
  );


app.use("/api/v1/user", user);
app.use("/api/v1/game", game);
app.use(errorMiddleware);