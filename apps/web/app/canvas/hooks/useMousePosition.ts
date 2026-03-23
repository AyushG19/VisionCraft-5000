import { PointType } from "@repo/common";
import { useCallback } from "react";

const useMousePosition = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  const getMousePos = useCallback(
    (e: MouseEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return { x: 0, y: 0 };
      }

      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [canvasRef],
  );

  const getScreenCoordinates = useCallback(
    (pos: PointType): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return { x: 0, y: 0 };
      }

      const rect = canvas.getBoundingClientRect();
      return {
        x: pos.x - rect.left,
        y: pos.y - rect.top,
      };
    },
    [canvasRef],
  );
  return { getMousePos, getScreenCoordinates };
};

export default useMousePosition;
