import { DrawElement, Room } from "@repo/common";
import { useUser } from "@repo/hooks";
import {
  createRoom,
  fetchChart,
  joinRoom,
  leaveRoom,
} from "app/api/canvas.api";
import { JoinRoomResponseType } from "app/canvas/types";

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

export async function fetchChartService(
  command: string,
): Promise<{ res: string }> {
  return await fetchChart(command);
}
