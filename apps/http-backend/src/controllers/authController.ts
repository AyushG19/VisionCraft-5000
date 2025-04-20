import { Request, Response } from "express";
import { prismaClient, Prisma } from "@repo/db/db";
import { CreateUserSchema, LoginSchema } from "@repo/common/types";
import bcrypt from "bcrypt";
import { BCRYPT_SALT } from "@repo/backend-common/config";
import jwtService from "@repo/backend-common/jwt.service";

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
      res.status(201).json({
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
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      res.status(401).json({
        error: "invalid credentials",
      });
      return;
    }
    res.status(200).json({
      token: jwtService.createAccessToken({ userId: user.id }),
    });
  } catch (error) {
    console.log("login error: ", error);
    res.status(500).json({
      error: "internal server error",
    });
  }
};
