import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkCode } from "../controllers/roomController.js";
const roomRouter: Router = express.Router();

roomRouter.post("/check-code", checkCode);
export default roomRouter;
