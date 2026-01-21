"use client";
import { useEffect, useRef } from "react";
import { WS_BE_URL } from "config";
import { WebSocketDataType } from "@repo/common/types";

export function useCanvasSocket(
  enabled: boolean,
  onMessage: (event: any) => void,
  roomId: string,
  slug: string,
  token: string,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const send = (
    type: WebSocketDataType["type"],
    paylaod: WebSocketDataType["payload"],
  ): void => {
    if (!wsRef.current) return;
    console.log("insend: ", { type: type, payload: paylaod });
    wsRef.current.send(JSON.stringify({ type: type, payload: paylaod }));
  };

  useEffect(() => {
    if (!enabled) return;
    console.log("in canvas socket");
    if (!roomId || !slug) {
      alert("No roomId or slug");
      return;
    }
    const ws = new WebSocket(
      `${WS_BE_URL}?roomId=${encodeURIComponent(roomId)}&slug=${slug}&token=${encodeURIComponent(token)}`,
    );
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("opened connection");
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: {},
        }),
      );
    };
    ws.onmessage = (event) => {
      onMessage(event);
      console.log("Event: ", event);
    };
    ws.onerror = (err) => console.error("WS error:", err);
    ws.onclose = (ev) => {
      console.log("WS closed:", ev);
      ws.send(
        JSON.stringify({
          type: "LEAVE_ROOM",
          payload: {},
        }),
      );
    };
    return () => ws.close();
  }, [enabled]);
  return { send };
}
