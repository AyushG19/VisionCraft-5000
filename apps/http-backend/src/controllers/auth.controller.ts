import { Request, Response } from "express";
import { prismaClient } from "@repo/db/db";
import bcrypt from "bcrypt";
import jwtService from "@repo/backend-common/jwt.service";
import { authConfig, rfTokenExpiry } from "../config/index.js";
import { AppError } from "../error/index.js";
import { accessJwtService, refreshJwtService } from "../utils/jwtInstance.js";
import { JwtPayloadType } from "@repo/common/types";

export const signup = async (req: Request, res: Response) => {
  try {
    console.log("hasing");
    const hashedPass = await bcrypt.hash(req.body.password, 10);

    const user = await prismaClient.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        password: hashedPass,
      },
      select: {
        id: true,
        name: true,
        photo: true,
      },
    });

    console.log("user generated");
    res
      .status(201)
      .cookie(
        "refreshToken",
        refreshJwtService.sign({ userId: user.id }, rfTokenExpiry),
        authConfig.refreshCookies
      )
      .cookie(
        "accessToken",
        accessJwtService.sign({ userId: user.id }, rfTokenExpiry),
        authConfig.accessCookies
      )
      .json({
        id: user.id,
        name: user.name,
      });
  } catch (error) {
    throw new AppError(500, "Controller error");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = await prismaClient.user.findUnique({
      where: { email: req.body.email },
    });
    console.log("in login");
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      throw new AppError(401, "password did not match");
    }
    res
      .status(201)
      .cookie(
        "refreshToken",
        refreshJwtService.sign({ userId: user.id }, rfTokenExpiry),
        authConfig.refreshCookies
      )
      .cookie(
        "accessToken",
        accessJwtService.sign({ userId: user.id }, rfTokenExpiry),
        authConfig.accessCookies
      )
      .json({
        id: user.id,
        name: user.name,
      });
  } catch (error) {
    throw new AppError(500, "some internal error");
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies) {
      throw new AppError(401, "No cookies found!");
    }
    const refreshToken = cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(401, "No Refresh token found!");
    }
    const jwtRes = accessJwtService.verify<JwtPayloadType>(refreshToken);
    res
      .status(201)
      .cookie(
        "refreshToken",
        refreshJwtService.sign({ userId: jwtRes.userId }, rfTokenExpiry),
        authConfig.refreshCookies
      )
      .cookie(
        "accessToken",
        accessJwtService.sign({ userId: jwtRes.userId }, rfTokenExpiry),
        authConfig.accessCookies
      )
      .json({
        message: "Token refresh Sucessful",
      });
  } catch (error) {
    throw new AppError(500, "Internal server error");
  }
};
