export type Camera = {
  x: number;
  y: number;
  z: number; // Zoom level (1 = 100%)
};

// Convert Mouse Event (Screen) to World Coordinates (where shapes live)
export const screenToWorld = (
  screenX: number,
  screenY: number,
  camera: Camera,
) => {
  return {
    x: (screenX - camera.x) / camera.z,
    y: (screenY - camera.y) / camera.z,
  };
};

// Convert World Coordinates back to Screen (for checking bounds etc if needed)
export const worldToScreen = (
  worldX: number,
  worldY: number,
  camera: Camera,
) => {
  return {
    x: worldX * camera.z + camera.x,
    y: worldY * camera.z + camera.y,
  };
};
