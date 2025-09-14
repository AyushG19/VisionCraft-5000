import { useEffect, useRef, useState } from "react";
import { WS_BE_URL } from "config";

export function useCanvasSocket(enabled: boolean) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const send = (message: string) => {
    if (!wsRef.current) return;
    wsRef.current.send(message);
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
      console.log(event);
      setMessages((prev) => [...prev, event.data]);
    };
    ws.onerror = (err) => console.error("WS error:", err);
    ws.onclose = (ev) => console.log("WS closed:", ev);

    return () => ws.close();
  }, [enabled]);
  return { send, messages };
}
