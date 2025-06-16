"use client";
import React, { useEffect, useRef } from "react";
import Toolkit from "@repo/ui/Toolkit";

const page = () => {
  const myRef = useRef<HTMLCanvasElement | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const isDrawing = useRef<boolean>(false);

  useEffect(() => {
    const canvas = myRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";

    const getMousePos = (e: MouseEvent) => {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      isDrawing.current = true;
      lastPos.current = getMousePos(e);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current || !lastPos.current) return;
      const currentPos = getMousePos(e);

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      lastPos.current = currentPos;
    };

    const onMouseUp = () => {
      isDrawing.current = false;
      lastPos.current = null;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className="w-screen h-screen">
      <Toolkit />
      <canvas
        ref={myRef}
        className="w-full h-full border bg-thistle-400 "
      ></canvas>
      ;
    </div>
  );
};

export default page;
