import express, { Router } from "express";
import { getProfile, getUserInfo } from "../controllers/user.controller";
import { checkAuth, checkAuthAndCreate } from "../middlewares";

const userRouter: Router = express.Router();

userRouter.post("/get-user", checkAuth, getUserInfo);
userRouter.get("/profile", checkAuthAndCreate, getProfile);

export default userRouter;
