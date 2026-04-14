import {
  type ProviderUser,
  type JwtPayloadType,
  ProviderUserSchema,
} from "@repo/common";
import * as express from "express";

declare global {
  namespace Express {
    interface User extends Partial<JwtPayloadType>, Partial<ProviderUser> {}
  }
}
