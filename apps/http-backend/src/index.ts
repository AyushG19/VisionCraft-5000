import express from "express";
import authRouter from "./routes/authRouter.js";
import roomRouter from "./routes/roomRouter.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);

app.listen(4000, () => {
  console.log("server running on 4000");
});
