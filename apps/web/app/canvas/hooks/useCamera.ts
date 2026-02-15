import { RefObject, useState } from "react";

export function useCamera(canvasRef: RefObject<HTMLCanvasElement>) {
  const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 });
  const canvas = canvasRef.current;
  const screenToWorld = (sX: number, sY: number) => ({
    x: (sX - camera.x) / camera.z,
    y: (sY - camera.y) / camera.z,
  });

  const applySnapBack = () => {
    const WORLD_LIMIT = 5000;
    const SNAP_SPEED = 0.15; // 0.1 to 0.2 is best for "buttery" feel

    setCamera((prev) => {
      const minX = canvas.width - WORLD_LIMIT * prev.z;
      const maxX = 0;
      const minY = canvas.height - WORLD_LIMIT * prev.z;
      const maxY = 0;

      // Target represents the "Legal" closest position
      const targetX = Math.min(Math.max(prev.x, minX), maxX);
      const targetY = Math.min(Math.max(prev.y, minY), maxY);

      // If we are already in bounds, stop animating
      if (
        Math.abs(prev.x - targetX) < 0.1 &&
        Math.abs(prev.y - targetY) < 0.1
      ) {
        return prev;
      }

      // Move a small percentage (SNAP_SPEED) toward the target every frame
      const nextX = prev.x + (targetX - prev.x) * SNAP_SPEED;
      const nextY = prev.y + (targetY - prev.y) * SNAP_SPEED;

      requestAnimationFrame(applySnapBack);
      return { ...prev, x: nextX, y: nextY };
    });
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();

    const WORLD_LIMIT = 5000;
    const PADDING = 150; // How far they can "pull" the elastic

    if (e.ctrlKey || e.metaKey) {
      // --- FOCAL ZOOM (TO CENTER) ---
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newZoom = Math.min(Math.max(camera.z + delta, 0.1), 5);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Use the Stay-Put Formula: C = S - (W * Z)
      const worldPosAtCenter = {
        x: (centerX - camera.x) / camera.z,
        y: (centerY - camera.y) / camera.z,
      };

      setCamera({
        x: centerX - worldPosAtCenter.x * newZoom,
        y: centerY - worldPosAtCenter.y * newZoom,
        z: newZoom,
      });
    } else {
      // --- PANNING WITH SNAP-BACK LOGIC ---
      setCamera((prev) => {
        // Calculate Bounds
        const minX = canvas.width - WORLD_LIMIT * prev.z - PADDING;
        const maxX = PADDING;
        const minY = canvas.height - WORLD_LIMIT * prev.z - PADDING;
        const maxY = PADDING;

        // Determine if we are currently out of bounds
        const isOutX = prev.x < minX || prev.x > maxX;
        const isOutY = prev.y < minY || prev.y > maxY;

        // Apply Friction (0.3) if out of bounds, otherwise 1:1 movement
        const friction = isOutX || isOutY ? 0.3 : 1;

        const nextX = prev.x - e.deltaX * friction;
        const nextY = prev.y - e.deltaY * friction;

        return { ...prev, x: nextX, y: nextY };
      });

      // Trigger the Snap-Back animation
      requestAnimationFrame(applySnapBack);
    }
  };

  return { camera, onWheel, screenToWorld };
}
