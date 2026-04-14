import { AppError, UserType } from "@repo/common/index";
import env from "../env";
import { Response, Request } from "express";
import { acTokenExpiry, authConfig, rfTokenExpiry } from "src/config";
import { accessJwtService, refreshJwtService } from "src/utils/jwtInstance";

const sendAuth201Res = (res: Response, user: UserType) => {
  res
    .status(201)
    .cookie(
      "refreshToken",
      refreshJwtService.sign({ userId: user.userId }, rfTokenExpiry),
      authConfig.refreshCookies,
    )
    .cookie(
      "accessToken",
      accessJwtService.sign({ userId: user.userId }, acTokenExpiry),
      authConfig.accessCookies,
    )
    .redirect(`${env.FRONTEND_URL}/canvas`);
};

export const handleProviderCallback = async (req: Request, res: Response) => {
  if (!req.user) return;
  sendAuth201Res(res, { userId: req.user.userId!, name: req.user.name! });
};
