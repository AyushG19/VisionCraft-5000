import { Request, Response, NextFunction } from "express";
import jwtService from "@repo/backend-common/jwt.service";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).json({
        error: "Missing Authorization header",
      });
      return;
    }
    const token = authorization.split(" ")[1];
    if (!token) {
      res.status(401).json({
        error: "Malformed Authorization header",
      });
      return;
    }
    const JwtPayload = jwtService.verifyToken(token);
    if (!JwtPayload.valid) {
      res.status(401).json({
        error: "invalid token",
      });
      return;
    }
    req.user = JwtPayload.decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: "invalid credentials",
    });
  }
};
