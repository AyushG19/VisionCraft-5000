import express, { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
import {
  checkCode,
  createRoom,
  leaveRoom,
} from "../controllers/roomController.js";
const roomRouter: Router = express.Router();

roomRouter.post("/check-code", checkAuth, checkCode);
roomRouter.post("/create", checkAuth, createRoom);
roomRouter.post("/leave", checkAuth, leaveRoom);

export default roomRouter;
