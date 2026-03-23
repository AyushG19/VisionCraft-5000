import { Camera } from "./math";

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  width: number,
  height: number,
) => {
  const gridSize = 50; // Base distance between dots
  const dotSize = 2; // Size of the dots

  // Calculate the visible world bounds
  const startCol = Math.floor(-camera.x / camera.z / gridSize);
  const endCol = startCol + width / camera.z / gridSize + 1;
  const startRow = Math.floor(-camera.y / camera.z / gridSize);
  const endRow = startRow + height / camera.z / gridSize + 1;

  ctx.save();
  // We draw the grid in World Space so we apply transform immediately
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.z, camera.z);

  ctx.fillStyle = "#ddd"; // Color of dots

  for (let i = startCol; i < endCol; i++) {
    for (let j = startRow; j < endRow; j++) {
      const x = i * gridSize;
      const y = j * gridSize;
      ctx.beginPath();
      // Draw a small circle for dot grid
      ctx.arc(x, y, dotSize / camera.z, 0, Math.PI * 2);

      ctx.fill();
    }
  }

  ctx.restore();
};
