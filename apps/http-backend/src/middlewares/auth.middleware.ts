import type { Request, Response, NextFunction } from "express";
import { AppError } from "../error";
import { JwtPayloadSchema, JwtPayloadType } from "@repo/common";
import { accessJwtService } from "../utils/jwtInstance";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new AppError(401, "No access token.");
    }
    const JwtPayload = accessJwtService.verify<JwtPayloadType>(accessToken);
    const parsedJwtPayload = JwtPayloadSchema.safeParse(JwtPayload);
    if (!parsedJwtPayload.success) throw new AppError(401, "Invalid token");
    req.user = parsedJwtPayload.data;
    next();
  } catch (error) {
    throw new AppError(401, "Error validating token.");
  }
};
