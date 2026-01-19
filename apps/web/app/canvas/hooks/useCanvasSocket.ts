import { useEffect, useRef, useState } from "react";
import { WS_BE_URL } from "config";
import { Action } from "../types";

export function useCanvasSocket(
  enabled: boolean,
  onMessage: (event: any) => void,
  roomId: string,
  slug: string
) {
  const wsRef = useRef<WebSocket | null>(null);
  const send = (message: any) => {
    if (!wsRef.current) return;
    wsRef.current.send(JSON.stringify(message));
  };

  useEffect(() => {
    if (!enabled) return;
    console.log("in canvas socket");
    if (!roomId || !slug) {
      alert("No roomId or slug");
      return;
    }
    const ws = new WebSocket(
      `${WS_BE_URL}?roomId=${encodeURIComponent(roomId)}&slug=${slug}`
    );
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("opened connection");
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
        })
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
        })
      );
    };
    return () => ws.close();
  }, [enabled]);
  return { send };
}
