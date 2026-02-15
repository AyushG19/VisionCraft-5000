/**
 * useMousePosition - NO PAN/ZOOM VERSION
 *
 * Simple mouse position - just canvas coordinates, no transform.
 */

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

  return { getMousePos };
};

export default useMousePosition;
