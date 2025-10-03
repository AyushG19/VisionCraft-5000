import express, { Router } from "express";
import { drawWithAi } from "../controllers/aiController.js";
const aiRouter: Router = express.Router();

aiRouter.post("/draw", drawWithAi);

export default aiRouter;
