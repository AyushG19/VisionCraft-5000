import express, { Router } from "express";
import { getUserInfo } from "src/controllers/user.controller";

const userRouter: Router = express.Router();

userRouter.post("/get-user", getUserInfo);

export default userRouter;
