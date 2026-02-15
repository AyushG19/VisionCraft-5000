import { ToolKitType } from "@repo/common";

export default function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  redraw: () => void,
  toolState: ToolKitType,
) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Set display size (CSS pixels)
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  // Set backing store size (scaled for HiDPI)
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale context to account for DPR
  ctx.scale(dpr, dpr);

  // Set drawing properties
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = toolState.strokeSize;

  // Redraw everything
  redraw();
}
