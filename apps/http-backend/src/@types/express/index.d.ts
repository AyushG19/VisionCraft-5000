import { type JwtPayloadType } from "@repo/common";
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayloadType;
    }
  }
}
