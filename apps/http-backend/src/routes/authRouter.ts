import express, { Router } from "express";
import { signup, login } from "../controllers/authController.js";

const authRouter: Router = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);

export default authRouter;
