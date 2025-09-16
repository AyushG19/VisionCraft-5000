import express, { Router } from "express";
import { checkAuth } from "../middlewares/authMiddleware.js";
import {
  checkCode,
  createRoom,
  saveCanvas,
} from "../controllers/roomController.js";
const roomRouter: Router = express.Router();

roomRouter.post("/check-code", checkAuth, checkCode);
roomRouter.post("/create", checkAuth, createRoom);
roomRouter.post("/save-canvas", checkAuth, saveCanvas);
export default roomRouter;
