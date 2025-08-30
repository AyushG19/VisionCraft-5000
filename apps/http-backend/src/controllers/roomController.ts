import { Request, Response } from "express";
import { prismaClient } from "@repo/db/db";
import { CreateRoomSchema } from "@repo/common/types";

const checkCode = (req: Request, res: Response) => {};
const createRoom = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.userId;
    const canvas = req.user.canvas;
    const canvasState = CreateRoomSchema.safeParse(req.body);
    if (!canvasState.success) {
      res.status(400).json({
        message: "invalid data",
        error: canvasState.error.flatten(),
      });
    }
    const room = await prismaClient.room.create({
      data: {
        slug: "1234",
        adminId: userId,
        canvas: canvas,
      },
    });
    res.json(room);
  } catch (error) {
    res.status(505).json(error);
  }
};

export { checkCode, createRoom };
