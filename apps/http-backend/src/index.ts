import express from "express";
import authRouter from "./routes/authRouter.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

app.listen(4000, () => {
  console.log("server running on 4000");
});
