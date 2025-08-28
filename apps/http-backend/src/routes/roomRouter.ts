import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
const roomRouter = express.Router();

export default roomRouter;
