import express from "express";
import {
  healthRouter,
  authRouter,
  roomRouter,
  aiRouter,
  userRouter,
} from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares";
import { corsConfig, port } from "./config/index.js";
const app = express();

app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/ai", aiRouter);
app.use("/api/health", healthRouter);
app.use("/api/user", userRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`[Http] server running on port : ${[port]}`);
});
