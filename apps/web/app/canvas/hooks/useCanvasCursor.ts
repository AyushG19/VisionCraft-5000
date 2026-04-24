import { useCallback } from "react";
import { AllToolTypes, DrawElement, ShapeType } from "@repo/common";
import { HandleName } from "../../lib/getHandles";
import {
  isInsideSelectBound,
  isPointInHandle,
  isClickOnShape,
} from "../utils/isPointInShape";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import { getCursorSvg, getPencilSvg } from "../utils/getCustonSvg";
import { getVariableValue } from "../utils/getCssColor";

const HANDLE_CURSORS: Record<HandleName, string> = {
  TOP: "n-resize",
  BOTTOM: "s-resize",
  LEFT: "w-resize",
  RIGHT: "e-resize",
  TOP_LEFT: "nw-resize",
  TOP_RIGHT: "ne-resize",
  BOTTOM_LEFT: "sw-resize",
  BOTTOM_RIGHT: "se-resize",
};

const CROSSHAIR_TOOLS = ["arrow", "rectangle", "ellipse", "diamond", "line"];

const useCanvasCursor = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  const updateCursor = useCallback(
    (
      tool: AllToolTypes,
      worldPos: { x: number; y: number },
      selectedShape: ShapeType | undefined,
      allShapes: DrawElement[],
      isPanning: boolean,
      spaceHeld: boolean,
      isDragging: boolean,
      isResizing: boolean,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isPanning) {
        canvas.style.cursor = "grabbing";
        return;
      }
      if (spaceHeld) {
        canvas.style.cursor = "grab";
        return;
      }

      // During drag/resize, keep the appropriate cursor
      if (isDragging) {
        canvas.style.cursor = "move";
        return;
      }
      if (isResizing) {
        // Cursor already set by handle detection, keep it
        return;
      }

      if (tool === "select") {
        // Check selected shape first (higher priority)
        if (selectedShape && !selectedShape.isDeleted) {
          const outlineBounds = getOutlineBounds(selectedShape);
          const handleBounds = getBoundsForHandles(selectedShape);

          // Check resize handles
          const hoveredHandle: HandleName | null = isPointInHandle(
            worldPos.x,
            worldPos.y,
            handleBounds,
            undefined,
            selectedShape,
          );

          if (hoveredHandle) {
            canvas.style.cursor = HANDLE_CURSORS[hoveredHandle];
            return;
          }

          // Check selected shape body
          if (isInsideSelectBound(worldPos, outlineBounds)) {
            canvas.style.cursor = "move";
            return;
          }
        }

        // Check other shapes
        const hoveredShape = allShapes.find((shape: DrawElement) =>
          isClickOnShape(worldPos, shape),
        );
        if (hoveredShape) {
          canvas.style.cursor = "move";
          return;
        }

        // Nothing hovered
        canvas.style.cursor = `${getCursorSvg("#FFFFFF")} 20 3, auto`;
        return;
      }

      // Drawing tool cursors
      if (CROSSHAIR_TOOLS.includes(tool)) {
        canvas.style.cursor = "crosshair";
        return;
      }

      if (tool === "pencil") {
        const color = getVariableValue("--canvas-contrast");
        canvas.style.cursor = `${getPencilSvg(color)} 3 16, auto`;
        return;
      }

      if (tool === "text") {
        canvas.style.cursor = "text";
        return;
      }

      canvas.style.cursor = "default";
    },
    [canvasRef],
  );

  return { updateCursor };
};

export default useCanvasCursor;
