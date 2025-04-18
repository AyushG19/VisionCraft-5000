import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { BCRYPT_SALT } from "@repo/backend-common/config";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization);

    next();
  } catch (error) {}
};
