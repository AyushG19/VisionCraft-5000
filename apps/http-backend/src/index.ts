import express from "express";
import authRouter from "./routes/auth.router.js";
import roomRouter from "./routes/roomRouter.js";
import aiRouter from "./routes/aiRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import { corsConfig, port } from "./config/index.js";
const app = express();
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/ai", aiRouter);
app.use(errorHandler);
app.listen(port, () => {
  console.log("server running");
});
