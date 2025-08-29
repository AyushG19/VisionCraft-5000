import express, { Router } from "express";
import { signup, login, refreshToken } from "../controllers/authController.js";

const authRouter: Router = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshToken);

export default authRouter;
