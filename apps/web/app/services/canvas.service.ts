import { joinRoom } from "app/api/canvas.api";
import { JoinRoomResponseType } from "app/canvas/types";

export async function joinRoomService(
  roomCode: string
): Promise<JoinRoomResponseType> {
  return await joinRoom(roomCode);
}
