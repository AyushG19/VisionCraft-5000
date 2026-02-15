/**
 * useCanvasSocket
 *
 * Manages WebSocket connection for real-time collaboration.
 * Handles connection lifecycle, message sending/receiving,
 * and automatic reconnection.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { env } from "../../../config";
import { SendPropsType } from "../types";
import useRoom from "./useRoom";
import { useSocketContext } from "@repo/hooks";

export function useCanvasSocket(
  onMessage: (event: MessageEvent) => void,
  roomId: string,
  slug: string,
  token: string,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [socketOpen, setSocketOpen] = useState<boolean>(false);
  const { setInRoom } = useSocketContext();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000;

  const { handleLeaveRoom } = useRoom();
  const send = (
    type: SendPropsType["type"],
    payload: SendPropsType["payload"],
  ): void => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready, message not sent:", type);
      return;
    }

    const message = JSON.stringify({ type, payload });
    wsRef.current.send(message);
  };

  useEffect(() => {
    if (!roomId || !slug || !token) {
      console.error(
        "Cannot connect: missing token, roomId or slug",
        roomId,
        slug,
        token,
      );
      return;
    }

    const connect = () => {
      const wsUrl = `${env.WS_BACKEND_URL}?roomId=${encodeURIComponent(roomId)}&slug=${slug}&token=${encodeURIComponent(token)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✓ WebSocket connected");
        reconnectAttemptsRef.current = 0;
        // Join the room
        ws.send(
          JSON.stringify({
            type: "JOIN_ROOM",
          }),
        );
        setInRoom(true);
      };

      ws.onmessage = (event) => {
        onMessage(event);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        wsRef.current = null;
        handleLeaveRoom(roomId);
        setInRoom(false);

        // Attempt reconnection if not a clean close
        if (
          !event.wasClean &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttemptsRef.current++;
          console.log(
            `Reconnecting... (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        }
      };
    };

    connect();

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        // Send leave message before closing
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "LEAVE_ROOM",
              payload: {},
            }),
          );
        }
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [roomId, slug, token]);

  return { send, socketOpen };
}
