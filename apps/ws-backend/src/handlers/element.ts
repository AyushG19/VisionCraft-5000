import { sendError, sendInfo } from "../helpers/ws.helper";
import { touchRoom } from "../room/room.lifecycle";
import { ElementRedisData } from "../services/element.service";
import { HandlerContext } from "../types";

export async function ADD_SHAPE({
  ws,
  roomId,
  userId,
  cleanData,
  services,
}: HandlerContext) {
  if (cleanData.type !== "ADD_SHAPE") return;

  const { payload } = cleanData;
  const { element } = services;
  if (!payload) {
    sendError(ws, "MALFORMED_PAYLOAD");
    return;
  }
  touchRoom(roomId);

  const event: ElementRedisData = { type: "ADD", userId, element: payload };
  element.add(roomId, event);

  sendInfo(ws, "Element added");
}

export async function UPD_SHAPE({
  ws,
  roomId,
  userId,
  cleanData,
  services,
}: HandlerContext) {
  if (cleanData.type !== "UPD_SHAPE") return;

  const { payload } = cleanData;
  const { element } = services;
  if (!payload) {
    sendError(ws, "MALFORMED_PAYLOAD");
    return;
  }
  touchRoom(roomId);

  const event: ElementRedisData = { type: "UPD", userId, element: payload };
  element.update(roomId, event);

  sendInfo(ws, "Shape updated");
}

export async function DEL_SHAPE({
  ws,
  roomId,
  userId,
  cleanData,
  services,
}: HandlerContext) {
  if (cleanData.type !== "DEL_SHAPE") return;

  const { payload } = cleanData;
  const { element } = services;
  if (!payload) {
    sendError(ws, "MALFORMED_PAYLOAD");
    return;
  }
  touchRoom(roomId);

  const event: ElementRedisData = { type: "DEL", userId, element: payload };
  element.delete(roomId, event);

  sendInfo(ws, "Shape deleted");
}
