import { PointType } from "@repo/common";

// Simple mouse position - no transform needed
export const getMousePos = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  pos: PointType,
): PointType => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  return {
    x: pos.x - rect.left,
    y: pos.y - rect.top,
  };
};
