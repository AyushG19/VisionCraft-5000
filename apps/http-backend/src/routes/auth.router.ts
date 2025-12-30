import express, { Router } from "express";
import { signup, login, refreshToken } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middlewate.js";
import { CreateUserSchema, LoginSchema } from "@repo/common/types";

const authRouter: Router = express.Router();

authRouter.post("/signup", validate(CreateUserSchema), signup);
authRouter.post("/login", validate(LoginSchema), login);
authRouter.post("/refresh-token", refreshToken);

export default authRouter;
