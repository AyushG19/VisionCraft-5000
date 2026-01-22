"use client";
import { UuidSchema, UuidType } from "@repo/common";

export const useRoomID = (): UuidType => {
  const roomID = localStorage.getItem("roomId");
  if (!roomID) throw new Error("roomID not found");
  const parsedRes = UuidSchema.safeParse(roomID);
  if (!parsedRes.success) throw new Error("Invalid Room-Id");
  return parsedRes.data;
};
