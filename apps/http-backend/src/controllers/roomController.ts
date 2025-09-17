import { Request, Response } from "express";
import { prismaClient } from "@repo/db/db";
import { CreateRoomSchema } from "@repo/common/types";
import { generateRandomCode } from "../utils/codeGenerator.js";

const checkCode = async (req: Request, res: Response) => {
  try {
    console.log("in check code");
    // const { roomId } = req.query;
    // if (!roomId || roomId !== "stirng") {
    //   res.status(400).json("Undefined or Invalid room ID");
    //   return;
    // }
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
      res
        .status(200)
        .json({ id: room.id, canvasState: room.canvas, slug: slug });
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

const saveCanvas = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.query;
    console.log(roomId, typeof roomId);
    if (!roomId || typeof roomId !== "string") {
      res.status(400).json("Undefined or Invalid room ID");
      return;
    }
    const { boardState: newCanvas } = req.body;
    if (!newCanvas) {
      res.status(400).json("Error saving canvas");
      return;
    }
    const room = await prismaClient.room.update({
      where: { id: roomId },
      data: { canvas: newCanvas, updatedAt: new Date() },
    });
    if (!room) {
      res.status(400).json("Room not found");
      return;
    }
    const updatedRoom = await prismaClient.room.update({
      where: { id: roomId },
      data: { canvas: newCanvas, updatedAt: new Date() },
    });
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.log("error in create room");
    res.status(505).json(error);
  }
};

export { checkCode, createRoom, saveCanvas };
