import express, { Router } from "express";
import { fetchMermaidSyntax } from "../controllers";
const aiRouter: Router = express.Router();

aiRouter.post("/draw", fetchMermaidSyntax);

export default aiRouter;
