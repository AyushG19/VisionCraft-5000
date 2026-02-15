/**
 * useCanvasCursor
 *
 * Manages cursor styles based on the active tool and what's under the cursor.
 * Completely isolated from interaction logic — this just sets canvas.style.cursor.
 *
 * Cursor priority (highest to lowest):
 * 1. Panning mode (space held or middle mouse) → "grab" or "grabbing"
 * 2. Resize handle hover → directional resize cursors
 * 3. Selected shape body hover → "move"
 * 4. Other shape hover → "move"
 * 5. Drawing tools → tool-specific cursors (crosshair, pencil, etc.)
 * 6. Default → "default"
 */

import { useCallback } from "react";
import { pencilIcon, selectIcon } from "../utils/pencilIcon";
import {
  AllToolSchema,
  AllToolTypes,
  DrawElement,
  ShapeType,
} from "@repo/common";
import { CanvasState } from "../types";
import { HandleName } from "../../lib/getHandles";
import { isInsideSelectBound, isPointInHandle } from "../utils/isPointInShape";
import isClickOnShape from "../utils/isPointInShape";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";

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

const CROSSHAIR_TOOLS = ["arrow", "rectangle", "ellipse", "triangle"];

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

      // ─── 1. Panning mode ──────────────────────────────────────
      if (isPanning) {
        canvas.style.cursor = "grabbing";
        return;
      }
      if (spaceHeld) {
        canvas.style.cursor = "grab";
        return;
      }

      // ─── 2. Active interactions ───────────────────────────────
      // During drag/resize, keep the appropriate cursor
      if (isDragging) {
        canvas.style.cursor = "move";
        return;
      }
      if (isResizing) {
        // Cursor already set by handle detection, keep it
        return;
      }

      // ─── 3. SELECT mode hover states ──────────────────────────
      if (tool === "select") {
        // Check selected shape first (higher priority)
        if (selectedShape) {
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
        canvas.style.cursor = `url(${selectIcon}) 20 3, auto`;
        return;
      }

      // ─── 4. Drawing tool cursors ──────────────────────────────
      if (CROSSHAIR_TOOLS.includes(tool)) {
        canvas.style.cursor = "crosshair";
        return;
      }

      if (tool === "pencil") {
        canvas.style.cursor = `url(${pencilIcon}) 3 16, auto`;
        return;
      }

      if (tool === "text") {
        canvas.style.cursor = "text";
        return;
      }

      // ─── 5. Fallback ──────────────────────────────────────────
      canvas.style.cursor = "default";
    },
    [canvasRef],
  );

  return { updateCursor };
};

export default useCanvasCursor;
