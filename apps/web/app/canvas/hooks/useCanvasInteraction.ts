"use client";

import { useEffect, useRef, useState } from "react";
import { DrawElement, PointType, ShapeType } from "@repo/common";
import { Action, CanvasState, TextEditState } from "../types";
import resizeCanvas from "../utils/canvasResizeHelper";
import redrawPreviousShapes from "../utils/redrawPreviousShapes";

import useInteractionState from "./useInteractionState";
import useCanvasCursor from "./useCanvasCursor";
import useSelectInteraction from "./useSelectInteraction";
import useDrawInteraction from "./useDrawingInteraction";
import useCanvasRenderer from "./useCanvasRenderer";
import { getMousePos } from "app/lib/coordinateHelper";

const useCanvasInteraction = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  canvasState: CanvasState,
  canvasDispatch: (action: Action) => void,
  dispatchWithSocket: (action: Action) => void,
  sendCursorState: (pos: PointType) => void,
  isOpen: boolean,
  setTextEdit: React.Dispatch<React.SetStateAction<TextEditState>>,
) => {
  const [selectedShape, setSelectedShape] = useState<DrawElement | undefined>(
    undefined,
  );

  const interactionState = useInteractionState();
  const cursor = useCanvasCursor(canvasRef);

  const selectInteraction = useSelectInteraction(
    interactionState,
    setSelectedShape,
    dispatchWithSocket,
  );

  const drawInteraction = useDrawInteraction(
    interactionState,
    dispatchWithSocket,
  );

  const selectedShapeRef = useRef(selectedShape);
  const canvasStateRef = useRef(canvasState);

  useCanvasRenderer(
    canvasRef,
    canvasState,
    selectedShape,
    canvasStateRef,
    selectedShapeRef,
    isOpen,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas(
      canvas,
      ctx,
      () => redrawPreviousShapes(ctx, canvasStateRef.current.drawnShapes),
      canvasStateRef.current.toolState,
    );

    const handleResize = () => {
      resizeCanvas(
        canvas,
        ctx,
        () => redrawPreviousShapes(ctx, canvasStateRef.current.drawnShapes),
        canvasStateRef.current.toolState,
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedShapeRef.current
      ) {
        e.preventDefault();
        dispatchWithSocket({
          type: "DEL_SHAPE",
          payload: selectedShapeRef.current,
        });
        setSelectedShape(undefined);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        canvasDispatch({ type: "UNDO" });
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        canvasDispatch({ type: "REDO" });
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
      const currentSelected = selectedShapeRef.current;
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;
      if (tool === "select") {
        const newSelected = selectInteraction.handleSelectMouseDown(
          pos,
          currentSelected,
          currentState,
        );
        if (newSelected?.type === "text") {
          setTextEdit({
            elementId: newSelected.id,
            text: newSelected.text,
            x: newSelected.startX,
            y: newSelected.startY,
          });
        }
        setSelectedShape(newSelected);
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
      const currentState = canvasStateRef.current;
      const currentSelected = selectedShapeRef.current;
      const tool = currentState.toolState.currentTool;
      console.log("current tool", tool);

      if (tool === "select") {
        const newSelected = selectInteraction.handleSelectMouseDown(
          pos,
          currentSelected,
          currentState,
        );
        setSelectedShape(newSelected);
      } else if (tool === "text") {
        e.preventDefault();
        setTextEdit(() => ({
          elementId: "1",
          text: "",
          x: pos.x,
          y: pos.y,
        }));
      } else {
        drawInteraction.handleDrawMouseDown(pos, currentState.toolState);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
      const currentState = canvasStateRef.current;
      const currentSelected = selectedShapeRef.current;
      const tool = currentState.toolState.currentTool;
      console.log("current selected: ", currentSelected);

      sendCursorState(pos);

      if (tool === "select") {
        selectInteraction.handleSelectMouseMove(
          pos,
          ctx,
          currentSelected,
          currentState,
        );
      } else {
        drawInteraction.handleDrawMouseMove(
          pos,
          ctx,
          currentState.toolState,
          currentState.drawnShapes,
          currentSelected?.id,
        );
      }

      cursor.updateCursor(
        tool,
        pos,
        currentSelected as ShapeType,
        currentState.drawnShapes,
        false,
        false,
        interactionState.interaction.current.isDragging,
        interactionState.interaction.current.isResizing,
      );
    };

    const onMouseUp = (e: MouseEvent) => {
      const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
      const currentState = canvasStateRef.current;
      const currentSelected = selectedShapeRef.current;
      const tool = currentState.toolState.currentTool;

      if (tool === "select") {
        selectInteraction.handleSelectMouseUp(
          pos,
          currentSelected as ShapeType,
        );
      } else {
        drawInteraction.handleDrawMouseUp(pos, currentState.toolState);
      }

      redrawPreviousShapes(
        ctx,
        currentState.drawnShapes,
        currentSelected,
        currentSelected?.id,
      );
      canvasDispatch({ type: "CHANGE_TOOL", payload: "select" });
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", onKeyDown);

    redrawPreviousShapes(
      ctx,
      canvasStateRef.current.drawnShapes,
      selectedShape,
      selectedShape?.id,
    );

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.addEventListener("dblclick", handleDoubleClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    selectedShapeRef.current = selectedShape;
  }, [selectedShape]);

  useEffect(() => {
    canvasStateRef.current = canvasState;
  }, [canvasState]);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if(!canvas) return;
  //   const ctx = canvas.getContext("2d");
  //   resizeCanvas(canvas,ctx,redrawPreviousShapes,);
  // }, [isOpen]);

  return {
    selectedShape,
    setSelectedShape,
  };
};

export default useCanvasInteraction;
