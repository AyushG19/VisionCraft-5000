// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../error/index.js";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Known, expected errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Unknown errors → log + hide details
  console.error("UNHANDLED ERROR:", err);

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
