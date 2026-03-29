import { ToolKitType } from "@repo/common";

export default function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  redraw: () => void,
  toolState: ToolKitType,
) {
  const parent = canvas.parentElement;
  const width = parent ? parent.clientWidth : window.innerWidth;
  const height = parent ? parent.clientHeight : window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.scale(dpr, dpr);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = toolState.strokeSize;

  redraw();
}
