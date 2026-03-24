"use client";

import { useEffect } from "react";
import { pingAllBackend } from "./api/ping";

export function PingProvider() {
  useEffect(() => {
    try {
      console.log("Pinging all backend...");
      pingAllBackend();
    } catch (error) {
      console.log("Error in PING");
    }
  }, []);

  return null;
}
