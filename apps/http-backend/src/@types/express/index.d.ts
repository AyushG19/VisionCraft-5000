import { type UserPayload } from "@repo/backend-common/AuthPayload";
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
}
