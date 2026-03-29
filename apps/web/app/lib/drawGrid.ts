import { Camera } from "./math";

const DOT_RADIUS = 1.5; // screen-space pixel radius (constant regardless of zoom)
const DOT_COLOR = "rgba(2, 0, 7, 1)";

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  width: number,
  height: number,
) => {
  const screenSpacing = 50;
  const worldSpacing = screenSpacing / camera.z;
  const base = 50;
  const level = Math.pow(2, Math.round(Math.log2(worldSpacing / base)));
  const adjustedSpacing = base * level;

  const worldLeft = (0 - camera.x) / camera.z;
  const worldTop = (0 - camera.y) / camera.z;
  const worldRight = (width - camera.x) / camera.z;
  const worldBottom = (height - camera.y) / camera.z;

  const startX = Math.floor(worldLeft / adjustedSpacing) * adjustedSpacing;
  const startY = Math.floor(worldTop / adjustedSpacing) * adjustedSpacing;

  ctx.fillStyle = DOT_COLOR;

  for (let wx = startX; wx <= worldRight; wx += adjustedSpacing) {
    for (let wy = startY; wy <= worldBottom; wy += adjustedSpacing) {
      ctx.beginPath();
      ctx.arc(wx, wy, DOT_RADIUS / camera.z, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
