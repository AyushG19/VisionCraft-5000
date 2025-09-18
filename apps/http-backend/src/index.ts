import express from "express";
import authRouter from "./routes/authRouter.js";
import roomRouter from "./routes/roomRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);

app.listen(4000, () => {
  console.log("server running on 4000");
});
