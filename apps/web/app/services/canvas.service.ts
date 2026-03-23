import { Room, JoinRoomResponseType } from "@repo/common";
import { createRoom, joinRoom, leaveRoom } from "app/api/canvas.api";

export async function joinRoomService(
  roomCode: string,
): Promise<JoinRoomResponseType> {
  return await joinRoom(roomCode);
}

export async function createRoomService(): Promise<Room> {
  return await createRoom();
}

export async function leaveRoomService(roomId: string) {
  return await leaveRoom(roomId);
}
