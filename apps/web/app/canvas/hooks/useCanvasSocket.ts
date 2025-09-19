import { useEffect, useRef, useState } from "react";
import { WS_BE_URL } from "config";
import { useWhiteBoard } from "./useWhiteBoard";

export function useCanvasSocket(enabled: boolean) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const { state, dispatch } = useWhiteBoard(enabled);
  const send = (message: string) => {
    if (!wsRef.current) return;
    wsRef.current.send(message);
  };
  const handleMessage = (event: any) => {
    switch (event.type) {
      case "ADD":
        dispatch({ type: "ADD_SHAPE", payload: event.shape });
        break;
      case "DEL":
        dispatch({ type: "DEL_SHAPE", payload: event.shape });
        break;
    }
  };
  useEffect(() => {
    if (!enabled) return;
    console.log("in canvas socket");
    const token = localStorage.getItem("token");
    const slug = localStorage.getItem("slug");
    if (!token || !slug) {
      alert("login with email to chat");
      return;
    }
    const ws = new WebSocket(
      `${WS_BE_URL}?token=${encodeURIComponent(token)}&slug=${slug}`
    );
    wsRef.current = ws;
    ws.onopen = () => console.log("event");
    ws.onmessage = (event) => {
      handleMessage(event);
      console.log(event);
    };
    ws.onerror = (err) => console.error("WS error:", err);
    ws.onclose = (ev) => console.log("WS closed:", ev);

    return () => ws.close();
  }, [enabled]);
  return { send, messages };
}
