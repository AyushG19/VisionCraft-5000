import { Request, Response } from "express";
import { prismaClient, Prisma } from "@repo/db/db";
import { CreateUserSchema, LoginSchema } from "@repo/common/types";
import bcrypt from "bcrypt";
import { BCRYPT_SALT } from "@repo/backend-common/config";
import jwtService from "@repo/backend-common/jwt.service";
import { decode } from "punycode";

const isDev = process.env.NODE_ENV === "development";

export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    // const existingUser = await prismaClient.user.findUnique({
    //   where: { email: parsed.data.email },
    // });
    // if (!existingUser) {
    //   res.status(409).json({ error: "user email already exist" });
    //   return;
    // }

    console.log("hasing");
    const hashedPass = await bcrypt.hash(parsed.data.password, 10);

    try {
      const user = await prismaClient.user.create({
        data: {
          email: parsed.data.email,
          name: parsed.data.name,
          password: hashedPass,
        },
      });

      console.log("user generated");
      res
        .status(201)
        .cookie(
          "refreshToken",
          jwtService.createRefreshToken({ userId: user.id }),
          {
            httpOnly: true,
            secure: !isDev,
            sameSite: isDev ? "lax" : "strict",
            maxAge: 60 * 60 * 1000,
          } // 1 hour
        )
        .json({
          id: user.id,
          email: user.email,
          name: user.name,
          token: jwtService.createAccessToken({ userId: user.id }),
        });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          res.status(409).json({ error: "user email already exist" });
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.log("signup error: ", error);
    res.status(500).json({
      error: "internal server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }
    const user = await prismaClient.user.findUnique({
      where: { email: parsed.data.email },
    });
    console.log("in login");
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      console.log(user);
      res.status(401).json({
        error: "invalid credentials",
      });
      return;
    }
    res
      .status(200)
      .cookie(
        "refreshToken",
        jwtService.createRefreshToken({ userId: user.id }),
        {
          httpOnly: true,
          secure: !isDev,
          sameSite: isDev ? "lax" : "strict",
          maxAge: 60 * 60 * 1000,
        } // 1 hour
      )
      .json({
        token: jwtService.createAccessToken({ userId: user.id }),
      });
  } catch (error) {
    console.log("login error: ", error);
    res.status(500).json({
      error: "internal server error",
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies) {
      res.status(401).json("Cookies not found.");
      return;
    }
    const refreshToken = cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json("Refresh token not found");
      return;
    }
    const jwtRes = jwtService.verifyToken(refreshToken);
    if (!jwtRes.valid || !jwtRes.decoded) {
      res.status(404).json("Refresh Token invalid");
      return;
    }
    res
      .status(200)
      .cookie(
        "refreshToken",
        jwtService.createRefreshToken({ userId: jwtRes.decoded.userId }),
        {
          httpOnly: true,
          secure: !isDev,
          sameSite: isDev ? "lax" : "strict",
          maxAge: 60 * 60 * 1000,
        } // 1 hour
      )
      .json({
        message: "Token refresh Sucessful",
        token: jwtService.createAccessToken({ userId: jwtRes.decoded.userId }),
      });
  } catch (error) {
    console.log("Token refresh error: ", error);
    res.status(500).json({
      error: "internal server error",
    });
  }
};
