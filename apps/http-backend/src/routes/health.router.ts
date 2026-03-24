import express, { Router } from "express";
import { sendPing } from "../controllers/health.controller.js";

const healthRouter: Router = express.Router();

healthRouter.get("/ping", sendPing);

export { healthRouter };
