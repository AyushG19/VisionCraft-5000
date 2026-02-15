/**
 * useCanvasRenderer - NO PAN/ZOOM VERSION
 *
 * Simple renderer without camera transforms.
 * Just syncs refs and triggers redraws.
 */

import { useEffect, RefObject, useRef } from "react";
import { DrawElement, ShapeType } from "@repo/common";
import { CanvasState } from "../types";
import redrawPreviousShapes from "../utils/redrawPreviousShapes";
import oklchToCSS from "../utils/oklchToCss";

const useCanvasRenderer = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  canvasState: CanvasState,
  selectedShape: DrawElement | undefined,
  canvasStateRef: React.MutableRefObject<CanvasState>,
  selectedShapeRef: React.MutableRefObject<DrawElement | undefined>,
  isOpen: boolean,
) => {
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    canvasStateRef.current = canvasState;
    selectedShapeRef.current = selectedShape;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      ctx.strokeStyle = oklchToCSS(canvasState.toolState.currentColor);
      ctx.lineWidth = canvasState.toolState.strokeSize;
      ctx.font = `${canvasState.textState.fontSize}px ${canvasState.textState.fontFamily}`;

      redrawPreviousShapes(
        ctx,
        canvasState.drawnShapes,
        selectedShape,
        selectedShape?.id,
      );

      frameRef.current = null;
    });

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [
    canvasState,
    selectedShape,
    canvasStateRef,
    selectedShapeRef,
    canvasRef,
    isOpen,
  ]);
};

export default useCanvasRenderer;
