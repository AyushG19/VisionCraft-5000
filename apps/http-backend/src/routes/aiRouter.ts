import express, { Router } from "express";
import { fetchMermaidSyntax } from "../controllers/aiController.js";
const aiRouter: Router = express.Router();

aiRouter.post("/draw", fetchMermaidSyntax);

export default aiRouter;
