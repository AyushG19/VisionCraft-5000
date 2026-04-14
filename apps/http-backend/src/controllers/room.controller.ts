import { Request, Response } from "express";
import {
  createNewRoom,
  findRoomFromSlug,
  removeUserFromRoom,
  insertUserToRoom,
} from "@repo/db";
import { generateRandomCode } from "../utils/codeGenerator";
import { DrawElement, JoinRoomResponseType } from "@repo/common";

const checkCode = async (req: Request, res: Response) => {
  try {
    console.log("in check code");
    if (!req.user) return;
    const { userId } = req.user;
    const { accessToken } = req.cookies;
    const slug = req.body.slug;
    if (!slug || !userId) {
      res.status(400).json("Invalid room ID/User ID");
      return;
    }
    const room = await findRoomFromSlug(slug);
    if (room && slug === room.slug) {
      const users = await insertUserToRoom(userId, room.id);
      const processedUsers = users.map((u) => ({ name: u.name, userId: u.id }));

      const resData: JoinRoomResponseType = {
        roomId: room.id,
        token: accessToken,
        users: processedUsers,
        canvasState: room.canvas.map((d) => d.data as unknown as DrawElement),
      };
      res.status(200).json(resData);
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
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json("UserId undefined");
      return;
    }

    const slug = generateRandomCode(4);
    console.log("Slug Generated");
    const newRoom = await createNewRoom(slug, userId);

    res.status(200).json(newRoom);
  } catch (error) {
    console.log("error in create room");
    res.status(505).json(error);
  }
};

const leaveRoom = async (req: Request, res: Response) => {
  try {
    if (!req.user) return;
    const { userId } = req.user;
    const { roomId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roomId) {
      return res.status(400).json({ message: "Room ID missing" });
    }

    removeUserFromRoom(userId, roomId);

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
