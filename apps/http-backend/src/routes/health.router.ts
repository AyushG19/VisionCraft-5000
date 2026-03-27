import express, { Router } from "express";
import { sendPing } from "../controllers";

const healthRouter: Router = express.Router();

healthRouter.get("/ping", sendPing);

export default healthRouter;
