"use client";

import { useEffect } from "react";
import { pingAllBackend } from "./api/ping";

export function PingProvider() {
  useEffect(() => {
    const ping = async () => {
      try {
        console.log("Pinging all backend...");
        await pingAllBackend();
      } catch (error) {
        console.log("Error in PING");
      }
    };
    ping();
  }, []);

  return null;
}
