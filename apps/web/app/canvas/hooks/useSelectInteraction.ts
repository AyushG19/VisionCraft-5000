import { useCallback } from "react";
import { ClientShapeManipulation, DrawElement, ShapeType } from "@repo/common";
import {
  isClickOnShape,
  isInsideSelectBound,
  isPointInHandle,
} from "../utils/isPointInShape";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import redrawPreviousShapes from "../utils/redrawPreviousShapes";
import { CanvasState, Action } from "../types";
import {
  createDraggedShape,
  createResizedShape,
} from "../utils/createTempShapeHelper";
import { HandleName } from "../../lib/getHandles";
import useInteractionState from "./useInteractionState";
import { Camera } from "./useCamera";

type UseInteractionStateReturn = ReturnType<typeof useInteractionState>;

const useSelectInteraction = (
  interactionState: UseInteractionStateReturn,
  setSelectedShape: (shape: DrawElement | undefined) => void,
  dispatchWithSocket: (action: Action) => void,
) => {
  const {
    interaction,
    startDrag,
    startResize,
    getDragState,
    getResizeState,
    resetDragAndResize,
  } = interactionState;

  // ═══ MOUSEDOWN ═════════════════════════════════════════════
  // Determines what was clicked and sets up the interaction mode.
  // Returns the shape that should become selected (or undefined).

  const handleSelectMouseDown = useCallback(
    (
      worldPos: { x: number; y: number },
      currentSelected: DrawElement | undefined,
      canvasState: CanvasState,
      activeElementMap: Map<
        string,
        {
          isDirty: boolean;
          element: DrawElement;
          operation: "resize" | "drag";
        }
      >,
    ): DrawElement | undefined => {
      //Case 1: Something already selected
      if (currentSelected) {
        const outlineBounds = getOutlineBounds(currentSelected);
        const handleBounds = getBoundsForHandles(currentSelected);

        // Clicked inside selected shape body? → Start drag
        if (isInsideSelectBound(worldPos, outlineBounds!)) {
          startDrag(currentSelected.id, worldPos, {
            x: currentSelected.startX,
            y: currentSelected.startY,
          });
          return currentSelected;
        }

        // Clicked on resize handle? → Start resize
        const hitHandle: HandleName | null = isPointInHandle(
          worldPos.x,
          worldPos.y,
          handleBounds!,
          undefined,
          currentSelected as ShapeType,
        );
        if (hitHandle) {
          startResize(hitHandle);
          return currentSelected;
        }
      }

      //  Case 2: Click on different shape
      // Search from end so topmost (last-drawn) wins
      const clickedShape = [...canvasState.drawnShapes]
        .reverse()
        .find((shape: DrawElement) => isClickOnShape(worldPos, shape));

      if (!clickedShape) return undefined;

      // Inside handleSelectMouseDown, before allowing selection of a shape:
      const isLockedByOther = [...activeElementMap.values()].some(
        (entry) => entry.element.id === clickedShape.id,
      );

      if (!isLockedByOther && !clickedShape.isDeleted) {
        // Immediately set up drag so click+drag works in one motion
        startDrag(clickedShape.id, worldPos, {
          x: clickedShape.startX,
          y: clickedShape.startY,
        });
        return clickedShape;
      }

      // ─── Case 3: Clicked empty space → Deselect ──────────────
      return undefined;
    },
    [startDrag, startResize],
  );

  // ═══ MOUSEMOVE ═════════════════════════════════════════════
  // Handles drag and resize previews.
  // Returns true if it consumed the event (did a redraw).

  const handleSelectMouseMove = useCallback(
    (
      worldPos: { x: number; y: number },
      ctx: CanvasRenderingContext2D,
      currentSelected: DrawElement | undefined,
      canvasState: CanvasState,
      camera: Camera,
      sendActiveElementUpdate: (event: ClientShapeManipulation) => void,
    ): boolean => {
      if (!currentSelected) return false;

      // ─── Drag preview ─────────────────────────────────────────
      if (interaction.current.isDragging) {
        const dragState = getDragState();
        const previewShape = createDraggedShape(
          dragState,
          worldPos,
          currentSelected,
        );

        redrawPreviousShapes(
          ctx,
          canvasState.drawnShapes,
          camera,
          previewShape,
          currentSelected.id,
        );
        sendActiveElementUpdate({ type: "DRAG", payload: previewShape });
        return true;
      }

      // ─── Resize preview ───────────────────────────────────────
      if (
        interaction.current.isResizing &&
        interaction.current.resizeDirection !== null
      ) {
        const resizeState = getResizeState();
        const previewShape = createResizedShape(
          resizeState,
          worldPos,
          currentSelected,
        );

        redrawPreviousShapes(
          ctx,
          canvasState.drawnShapes,
          camera,
          previewShape,
          currentSelected.id,
        );
        sendActiveElementUpdate({ type: "RESIZE", payload: previewShape });
        return true;
      }

      return false;
    },
    [interaction, getDragState, getResizeState],
  );

  // ═══ MOUSEUP ═══════════════════════════════════════════════
  // Commits drag or resize, updates selected shape, resets flags.

  const handleSelectMouseUp = useCallback(
    (
      worldPos: { x: number; y: number },
      currentSelected: DrawElement | undefined,
    ) => {
      if (!currentSelected) {
        resetDragAndResize();
        return;
      }

      // ─── Commit drag ──────────────────────────────────────────
      if (interaction.current.isDragging) {
        const dragState = getDragState();
        const finalShape = createDraggedShape(
          dragState,
          worldPos,
          currentSelected,
        );

        dispatchWithSocket({
          type: "UPD_SHAPE",
          payload: finalShape,
        });

        setSelectedShape(finalShape);
      }

      // ─── Commit resize ────────────────────────────────────────
      if (interaction.current.isResizing) {
        const resizeState = getResizeState();
        const finalShape = createResizedShape(
          resizeState,
          worldPos,
          currentSelected,
        );

        dispatchWithSocket({
          type: "UPD_SHAPE",
          payload: finalShape,
        });

        setSelectedShape(finalShape);
      }

      resetDragAndResize();
    },
    [
      interaction,
      getDragState,
      getResizeState,
      dispatchWithSocket,
      setSelectedShape,
      resetDragAndResize,
    ],
  );

  return {
    handleSelectMouseDown,
    handleSelectMouseMove,
    handleSelectMouseUp,
  };
};

export default useSelectInteraction;
