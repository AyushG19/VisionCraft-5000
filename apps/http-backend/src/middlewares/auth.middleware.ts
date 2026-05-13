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
export const checkAuthAndCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { accessToken, refreshToken } = req.cookies;

  if (accessToken) {
    try {
      const parsed = JwtPayloadSchema.safeParse(
        accessJwtService.verify<JwtPayloadType>(accessToken),
      );
      if (parsed.success) {
        req.user = parsed.data;
        return next();
      }
    } catch {
      // expired or malformed — fall through to refresh token
    }
  }

  if (refreshToken) {
    try {
      const parsed = JwtPayloadSchema.safeParse(
        accessJwtService.verify<JwtPayloadType>(refreshToken),
      );
      if (parsed.success) {
        req.user = parsed.data;
        return next();
      }
    } catch {
      // refresh token also expired/invalid
    }
  }

  throw new AppError(400, "Invalid or missing tokens.");
};
