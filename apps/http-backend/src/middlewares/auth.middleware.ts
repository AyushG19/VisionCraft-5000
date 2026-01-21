import type { Request, Response, NextFunction } from "express";
import { AppError } from "../error/index.js";
import { JwtPayloadSchema, JwtPayloadType } from "@repo/common/types.js";
import { accessJwtService } from "../utils/jwtInstance.js";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new AppError(401, "Invalid token.");
    }
    const JwtPayload = accessJwtService.verify<JwtPayloadType>(accessToken);
    const parsedJwtPayload = JwtPayloadSchema.safeParse(JwtPayload);
    if (!parsedJwtPayload.success) throw new AppError(401, "Invalid token");
    req.user = parsedJwtPayload.data.userId;
    next();
  } catch (error) {
    throw new AppError(401, "Invalid token.");
  }
};
