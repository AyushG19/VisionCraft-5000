import { Request, Response } from "express";

export async function sendPing(req: Request, res: Response) {
  res.status(200).json("Server running.");
}
