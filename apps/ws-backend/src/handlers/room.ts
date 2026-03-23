import { removeUserFromRoom } from "@repo/db";
import { sendInfo } from "../helpers/ws.helper";
import { ensureRoomSubscription, touchRoom } from "../room/room.lifecycle";
import { roomRegistry } from "../room/room.state";
import { HandlerContext } from "../types";

export async function JOIN_ROOM({ ws, roomId, userId }: HandlerContext) {
  await ensureRoomSubscription(roomId);

  if (!roomRegistry.has(roomId)) {
    roomRegistry.set(roomId, new Map());
  }
  roomRegistry.get(roomId)!.set(userId, { socket: ws, joinedAt: Date.now() });
  touchRoom(roomId);

  sendInfo(ws, "Room joined successfully");
}

export async function LEAVE_ROOM({ ws, roomId, userId }: HandlerContext) {
  await removeUserFromRoom(roomId, userId);
  ws.close(1000, "User left room");
}
