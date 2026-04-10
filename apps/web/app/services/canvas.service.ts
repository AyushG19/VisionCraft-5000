import { Room, JoinRoomResponseType } from "@repo/common";
import { createRoom, joinRoom, leaveRoom, uploadImg } from "app/api/canvas.api";
import { set } from "idb-keyval";

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

export async function storeImg(imageBlob: Blob): Promise<string> {
  const formData = new FormData();
  const file = new File([imageBlob], "image.webp", { type: "image/webp" });
  formData.append("file", file);
  formData.append("upload_preset", "visioncraft");
  // Debug — verify no [] keys
  for (const [key, value] of formData.entries()) {
    console.log("FormData key:", key, "value:", value);
  }
  const res = await uploadImg(formData);
  return res.secure_url as string;
}
