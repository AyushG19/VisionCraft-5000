import { AppError } from "../error";
import { findUserInfoWithId } from "@repo/db";
import { Request, Response } from "express";
import { accessJwtService, refreshJwtService } from "../utils/jwtInstance";
import { acTokenExpiry, authConfig, rfTokenExpiry } from "../config";

export async function getUserInfo(req: Request, res: Response): Promise<void> {
  const { userId } = req.body;
  if (!userId) throw new AppError(401, "User ID not valid or missing.");

  const dbRes = await findUserInfoWithId(userId);
  if (!dbRes) throw new AppError(401, "User not found.");

  res.status(200).json(dbRes);
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) return;
  const { userId } = req.user;
  if (!userId) throw new AppError(401, "User ID not valid or missing.");

  const dbRes = await findUserInfoWithId(userId);
  if (!dbRes) throw new AppError(401, "User not found.");

  res
    .status(200)
    .cookie(
      "refreshToken",
      refreshJwtService.sign({ userId: userId }, rfTokenExpiry),
      authConfig.refreshCookies,
    )
    .cookie(
      "accessToken",
      accessJwtService.sign({ userId: userId }, acTokenExpiry),
      authConfig.accessCookies,
    )
    .json(dbRes);
}
