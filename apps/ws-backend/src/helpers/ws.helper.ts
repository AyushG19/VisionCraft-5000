import { WebSocket } from "ws";
import { roomRegistry } from "../room/room.state";

export function sendJson(ws: WebSocket, payload: object): void {
  ws.send(JSON.stringify(payload));
}

export function sendError(ws: WebSocket, message: string): void {
  sendJson(ws, { type: "ERROR", message });
}

export function sendInfo(ws: WebSocket, message: string): void {
  sendJson(ws, { type: "INFO", message });
}

export function broadcastToRoom(
  roomId: string,
  senderId: string,
  socketMessage: object,
): void {
  const room = roomRegistry.get(roomId);
  if (!room) return;

  const payload = JSON.stringify(socketMessage);
  for (const [userId, { socket }] of room) {
    if (userId === senderId) continue;
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  }
}
