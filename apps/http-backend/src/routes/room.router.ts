import express, { Router } from "express";
import { checkAuth } from "../middlewares";
import { checkCode, createRoom, leaveRoom } from "../controllers";
const roomRouter: Router = express.Router();

roomRouter.post("/check-code", checkAuth, checkCode);
roomRouter.post("/create", checkAuth, createRoom);
roomRouter.post("/leave", checkAuth, leaveRoom);

export default roomRouter;
