import { useCallback } from "react";
import { Action, SideToolKitState } from "../types";
import redrawPreviousShapes from "../utils/redrawPreviousShapes";
import {
  createNewPencil,
  createNewShape,
  finishPencil,
  updatePencil,
} from "../utils/createNewShape";
import { DrawElement, PencilType, PointType, ToolKitType } from "@repo/common";
import useInteractionState from "./useInteractionState";
import { Camera } from "./useCamera";

type UseInteractionStateReturn = ReturnType<typeof useInteractionState>;

const useDrawInteraction = (
  interactionState: UseInteractionStateReturn,
  dispatchWithSocket: (action: Action) => void,
) => {
  const { interaction, tempShape, startDrawing, setTempShape, stopDrawing } =
    interactionState;

  // ═══ MOUSEDOWN ═════════════════════════════════════════════
  // Initializes drawing. For pencil, creates the temp shape immediately.

  const handleDrawMouseDown = useCallback(
    (worldPos: PointType, toolKitState: ToolKitType) => {
      startDrawing(worldPos);

      // Pencil is special — create temp shape on mousedown so even
      // a single click (no drag) creates a dot
      if (toolKitState.currentTool === "pencil") {
        const initialShape = createNewPencil(
          worldPos,
          toolKitState.strokeSize,
          toolKitState.currentColor,
        );
        setTempShape(initialShape);
      }
    },
    [startDrawing, setTempShape],
  );

  // ═══ MOUSEMOVE ═════════════════════════════════════════════
  // Updates preview for regular shapes or streams points for pencil.

  const handleDrawMouseMove = useCallback(
    (
      worldPos: PointType,
      ctx: CanvasRenderingContext2D,
      toolState: ToolKitType,
      sideToolKit: SideToolKitState,
      drawnShapes: DrawElement[],
      selectedShapeId: string | undefined,
      camera: Camera,
    ) => {
      if (!interaction.current.isDrawing) return;

      const tool = toolState.currentTool;

      // ─── PENCIL tool (streaming) ──────────────────────────────
      if (tool === "pencil") {
        if (!tempShape.current || tempShape.current.type !== "pencil") return;

        const updatedPencil = updatePencil(
          worldPos,
          tempShape.current as PencilType,
        );
        setTempShape(updatedPencil);

        // Redraw with the growing pencil shape appended
        redrawPreviousShapes(
          ctx,
          [...drawnShapes, updatedPencil],
          camera,
          undefined,
          selectedShapeId,
        );
        return;
      }

      // ─── Regular shapes (preview from start→current) ─────────
      const previewShape = createNewShape(
        toolState,
        sideToolKit,
        interaction.current.startPos,
        worldPos,
      );

      redrawPreviousShapes(
        ctx,
        drawnShapes,
        camera,
        previewShape,
        selectedShapeId,
      );
    },
    [interaction, tempShape, setTempShape],
  );

  // ---- MOUSEUP
  // Finalizes and commits the shape.

  const handleDrawMouseUp = useCallback(
    (
      worldPos: PointType,
      toolKitState: ToolKitType,
      sideTookKitState: SideToolKitState,
    ) => {
      if (!interaction.current.isDrawing) return;

      const tool = toolKitState.currentTool;

      // ─── PENCIL tool (finalize) ───────────────────────────────
      if (tool === "pencil") {
        stopDrawing();
        if (tempShape.current && tempShape.current.type === "pencil") {
          const finalShape = finishPencil(tempShape.current as PencilType);
          dispatchWithSocket({
            type: "ADD_SHAPE",
            payload: finalShape,
          });
          setTempShape(null);
        }
        return;
      }

      // ─── Regular shapes (finalize from start→end) ────────────
      const finalShape = createNewShape(
        toolKitState,
        sideTookKitState,
        interaction.current.startPos,
        worldPos,
      );

      dispatchWithSocket({
        type: "ADD_SHAPE",
        payload: finalShape,
      });

      stopDrawing();
    },
    [interaction, tempShape, stopDrawing, setTempShape, dispatchWithSocket],
  );

  return {
    handleDrawMouseDown,
    handleDrawMouseMove,
    handleDrawMouseUp,
  };
};

export default useDrawInteraction;
