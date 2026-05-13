import { warmupDb } from "@repo/db";
import { Request, Response } from "express";

export async function sendPing(req: Request, res: Response) {
  await warmupDb();
  res.status(200).json("Server running.");
}
