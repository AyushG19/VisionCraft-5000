import express, { Router } from "express";
import { signup, login, refreshToken } from "../controllers";
import { validate } from "../middlewares";
import { CreateUserSchema, LoginSchema } from "@repo/common";

const authRouter: Router = express.Router();

authRouter.post("/signup", validate(CreateUserSchema), signup);
authRouter.post("/login", validate(LoginSchema), login);
authRouter.post("/refresh-token", refreshToken);

export default authRouter;
