import { ZodTypeAny } from "@repo/common";
import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";

export const validate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new Error("Invalid user data");
    }
    req.body = parsed.data;
    next();
  };
