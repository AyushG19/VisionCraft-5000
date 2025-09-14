import { Request, Response } from "express";
import { prismaClient } from "@repo/db/db";
import { CreateRoomSchema } from "@repo/common/types";
import { generateRandomCode } from "../utils/codeGenerator.js";

const checkCode = async (req: Request, res: Response) => {
  try {
    console.log("in check code");
    const slug = req.body.slug;
    if (!slug) {
      res.status(400).json("Invalid room Id");
      return;
    }
    const room = await prismaClient.room.findFirst({
      where: {
        slug: slug,
      },
    });
    if (room && slug === room.slug) {
      res.status(200).json({ roomId: room.id, canvasState: room.canvas });
      return;
    }
    res.status(400).json("Bad Request");
  } catch (error) {
    res.status(505).json("Internam Server Error");
  }
};
const createRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const canvas = req.body.canvas;
    if (!userId) {
      res.status(401).json("UserId undefined");
      return;
    }

    const slug = generateRandomCode(4);
    console.log("slug genrrate");
    const newRoom = await prismaClient.room.create({
      data: {
        slug: slug,
        admin: {
          connect: {
            id: userId,
          },
        },
        canvas: canvas,
      },
    });
    res.status(200).json(newRoom);
  } catch (error) {
    console.log("error in create room");
    res.status(505).json(error);
  }
};

export { checkCode, createRoom };
