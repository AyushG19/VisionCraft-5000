import express, { Router } from "express";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkCode, createRoom } from "../controllers/roomController.js";
const roomRouter: Router = express.Router();

roomRouter.post("/check-code", checkCode);
roomRouter.post("/create", checkAuth, createRoom);
export default roomRouter;
