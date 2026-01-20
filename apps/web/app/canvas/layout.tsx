"use client";
import React from "react";
import { SocketContextProvider } from "@repo/hooks";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SocketContextProvider> {children}</SocketContextProvider>;
}
