import { Request, Response } from "express";
import { prismaClient } from "@repo/db";
import { generateRandomCode } from "../utils/codeGenerator.js";

const checkCode = async (req: Request, res: Response) => {
  try {
    console.log("in check code");
    // const { roomId } = req.query;
    // if (!roomId || roomId !== "stirng") {
    //   res.status(400).json("Undefined or Invalid room ID");
    //   return;
    // }
    const { userId } = req.user;
    const { accessToken } = req.cookies;
    const slug = req.body.slug;
    if (!slug || !userId) {
      res.status(400).json("Invalid room ID/User ID");
      return;
    }
    const room = await prismaClient.room.findFirst({
      where: {
        slug: slug,
      },
    });
    if (room && slug === room.slug) {
      await prismaClient.roomUser.create({
        data: {
          user: {
            connect: { id: userId },
          },
          room: {
            connect: { id: room.id },
          },
        },
      });

      res.status(200).json({
        roomId: room.id,
        token: accessToken,
      });
      return;
    }
    res.status(400).json("Bad Request");
  } catch (error) {
    console.log(error);
    res.status(505).json("Internam Server Error");
  }
};
const createRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
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
      },
    });
    await prismaClient.roomUser.create({
      data: {
        userId: newRoom.adminId,
        roomId: newRoom.id,
      },
    });
    res.status(200).json(newRoom);
  } catch (error) {
    console.log("error in create room");
    res.status(505).json(error);
  }
};

const leaveRoom = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { roomId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roomId) {
      return res.status(400).json({ message: "Room ID missing" });
    }

    await prismaClient.roomUser.delete({
      where: {
        roomId_userId: {
          userId,
          roomId,
        },
      },
    });

    res.status(200).json({ message: "User left room successfully" });
  } catch (error: any) {
    // Handle "record not found"
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not in this room" });
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const saveCanvas = async (req: Request, res: Response) => {
//   try {
//     const { roomId } = req.query;
//     console.log(roomId, typeof roomId);
//     if (!roomId || typeof roomId !== "string") {
//       res.status(400).json("Undefined or Invalid room ID");
//       return;
//     }
//     const { boardState: newCanvas } = req.body;
//     if (!newCanvas) {
//       res.status(400).json("Error saving canvas");
//       return;
//     }
//     const room = await prismaClient.room.update({
//       where: { id: roomId },
//       data: { canvas: newCanvas, updatedAt: new Date() },
//     });
//     if (!room) {
//       res.status(400).json("Room not found");
//       return;
//     }
//     const updatedRoom = await prismaClient.room.update({
//       where: { id: roomId },
//       data: { canvas: newCanvas, updatedAt: new Date() },
//     });
//     res.status(200).json(updatedRoom);
//   } catch (error) {
//     console.log("error in create room");
//     res.status(505).json(error);
//   }
// };

export { checkCode, createRoom, leaveRoom };
