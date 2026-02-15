import { Camera, screenToWorld } from "./math";

// --- COORDINATE HELPER ---
export const getMousePos = (
  canvas: HTMLCanvasElement,
  e: MouseEvent,
  camera: Camera,
) => {
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;

  // IMPORTANT: Convert to World Coordinates
  return screenToWorld(screenX, screenY, camera);
};
