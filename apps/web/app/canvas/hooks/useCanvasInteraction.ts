import React, { useEffect, useRef } from "react";
import pencilIcon from "../utils/pencilIcon";
import { ShapeType } from "@repo/common/types";
import isClickOnShape, {
  isInsideSelectBound,
  isPointInHandle,
} from "../utils/isPointInShape";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import resizeCanvas from "../utils/canvasResizeHelper";
import redrawPreviousShapes from "../utils/redrawPreviousShapes";
import {
  Action,
  CanvasState,
  DragStateType,
  InteractionState,
  ResizeStateType,
} from "../types";
import oklchToCSS from "../utils/oklchToCss";
import createNewShape from "../utils/createNewShape";
import {
  createDraggedShape,
  createResizedShape,
} from "../utils/createTempShapeHelper";
import { HandleName } from "../utils/getHandles";

const handleCursors: Record<HandleName, string> = {
  TOP: "n-resize",
  BOTTOM: "s-resize",
  LEFT: "w-resize",
  RIGHT: "e-resize",
  TOP_LEFT: "nw-resize",
  TOP_RIGHT: "ne-resize",
  BOTTOM_LEFT: "sw-resize",
  BOTTOM_RIGHT: "se-resize",
};

const useCanvasInteraction = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  canvasState: CanvasState,
  selectedShape: ShapeType | undefined,
  setSelectedShape: (shape: ShapeType | undefined) => void,
  canvasDispatch: (action: Action) => void,
  dispatchWithSocket: (action: Action) => void,
) => {
  const crosshairTools = ["SQUARE", "CIRCLE", "ARROW", "TRIANGLE"];
  const selectedShapeRef = useRef(selectedShape);
  const canvasStateRef = useRef(canvasState);
  const interactionRef = useRef<InteractionState>({
    isDrawing: false,
    isDragging: false,
    isResizing: false,
    draggedShapeId: null,
    resizeDirection: null,
    startPos: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
  });

  useEffect(() => {
    canvasStateRef.current = canvasState;
    selectedShapeRef.current = selectedShape;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = oklchToCSS(canvasState.toolState.currentColor);
        redrawPreviousShapes(ctx, canvasState.drawnShapes, selectedShape);
      }
    }
  }, [canvasState, selectedShape]);

  const getMousePos = (e: MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const createDragState = (): DragStateType => ({
    draggedShapeId: interactionRef.current.draggedShapeId,
    isDragging: interactionRef.current.isDragging,
    offsetX: interactionRef.current.dragOffset.x,
    offsetY: interactionRef.current.dragOffset.y,
  });

  const createResizeState = (): ResizeStateType => ({
    isResizing: interactionRef.current.isResizing,
    resizeDirection: interactionRef.current.resizeDirection,
  });
  //helps in reclicking of same shape
  const locateClick = (
    currPos: { x: number; y: number },
    currentSelected: ShapeType | undefined,
    currentState: CanvasState,
  ) => {
    const clickedShape = currentState.drawnShapes.find((shape: ShapeType) =>
      isClickOnShape(currPos, shape),
    );
    if (
      currentSelected &&
      (isInsideSelectBound(currPos, getOutlineBounds(currentSelected)) ||
        isPointInHandle(
          currPos.x,
          currPos.y,
          getBoundsForHandles(currentSelected),
          undefined,
          currentSelected,
        ))
    ) {
      return currentSelected;
    } else if (clickedShape) {
      interactionRef.current = {
        ...interactionRef.current,
        isDragging: true,
        draggedShapeId: clickedShape.id,
        dragOffset: {
          x: currPos.x - clickedShape.startX,
          y: currPos.y - clickedShape.startY,
        },
      };
      return clickedShape;
    } else {
      return undefined;
    }
  };

  const updateCursorStyle = (tool: string, pos: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (crosshairTools.includes(tool)) {
      canvas.style.cursor = "crosshair";
    } else if (tool === "PENCIL") {
      canvas.style.cursor = `url(${pencilIcon}) 3 16 ,auto`;
    } else if (
      selectedShapeRef.current &&
      isInsideSelectBound(pos, getOutlineBounds(selectedShapeRef.current))
    ) {
      canvas.style.cursor = "move";
    } else {
      canvas.style.cursor = "default";
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas(
      canvas,
      ctx,
      () => redrawPreviousShapes(ctx, canvasState.drawnShapes),
      canvasState.toolState,
    );
    const handleResize = () => {
      resizeCanvas(
        canvas,
        ctx,
        () => redrawPreviousShapes(ctx, canvasState.drawnShapes),
        canvasState.toolState,
      );
    };

    const onMouseDown = (e: MouseEvent) => {
      const currPos = getMousePos(e);
      const currentSelected = selectedShapeRef.current;
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;

      if (tool === "SELECT") {
        if (currentSelected) {
          if (isInsideSelectBound(currPos, getOutlineBounds(currentSelected))) {
            interactionRef.current = {
              ...interactionRef.current,
              isDragging: true,
              draggedShapeId: currentSelected.id,
              dragOffset: {
                x: currPos.x - currentSelected.startX,
                y: currPos.y - currentSelected.startY,
              },
            };
          } else if (
            isPointInHandle(
              currPos.x,
              currPos.y,
              getBoundsForHandles(currentSelected),
              undefined,
              currentSelected,
            )
          ) {
            interactionRef.current = {
              ...interactionRef.current,
              isResizing: true,
              resizeDirection: isPointInHandle(
                currPos.x,
                currPos.y,
                getBoundsForHandles(currentSelected),
                undefined,
                currentSelected,
              ),
            };
          }
        }
        const clickedShape = locateClick(
          currPos,
          currentSelected,
          currentState,
        );
        setSelectedShape(clickedShape);
        return;
      }

      //   setSelectedShape(undefined);
      //initializing interaction ref
      interactionRef.current = {
        ...interactionRef.current,
        startPos: { x: currPos.x, y: currPos.y },
        isDrawing: true,
      };
      if (tool === "PENCIL") {
        console.log(interactionRef.current.startPos);
        canvasDispatch({
          type: "ADD_SHAPE",
          payload: createNewShape(
            currentState.toolState,
            interactionRef.current.startPos,
            { x: 0, y: 0 },
          ),
        });
        return;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const currPos = getMousePos(e);
      const currentState = canvasStateRef.current;
      const currentSelected = selectedShapeRef.current;
      const tool = currentState.toolState.currentTool;
      if (tool === "SELECT") {
        let hoveredShape;
        //------------DRAGGING FUNCITON------------------//
        if (currentSelected && interactionRef.current.isDragging) {
          console.log("in draggin");
          const dragState = createDragState();
          redrawPreviousShapes(
            ctx,
            currentState.drawnShapes,
            createDraggedShape(dragState, currPos, currentSelected),
            currentSelected.id,
          );
          return;
        }
        if (
          currentSelected &&
          interactionRef.current.isResizing &&
          interactionRef.current.resizeDirection !== null
        ) {
          const resizestate = createResizeState();
          console.log("resize 227");
          redrawPreviousShapes(
            ctx,
            currentState.drawnShapes,
            createResizedShape(resizestate, currPos, currentSelected),
            currentSelected.id,
          );
          return;
        }
        if (currentSelected && !interactionRef.current.isDragging) {
          const outlineBounds = getOutlineBounds(currentSelected);
          const bounds = getBoundsForHandles(currentSelected);

          const hoveredHandle: HandleName | null = isPointInHandle(
            currPos.x,
            currPos.y,
            bounds,
            undefined,
            currentSelected,
          );
          if (hoveredHandle) {
            canvas.style.cursor = handleCursors[hoveredHandle];
          } else if (isInsideSelectBound(currPos, outlineBounds)) {
            canvas.style.cursor = "move";
          } else {
            hoveredShape = currentState.drawnShapes.find((shape: ShapeType) =>
              isClickOnShape(currPos, shape),
            );
            canvas.style.cursor = hoveredShape ? "move" : "default";
          }
        } else if (!interactionRef.current.isDragging) {
          hoveredShape = currentState.drawnShapes.find((shape: ShapeType) =>
            isClickOnShape(currPos, shape),
          );
          canvas.style.cursor = hoveredShape ? "move" : "default";
        }
        if (
          !currentSelected ||
          interactionRef.current.draggedShapeId !== currentSelected.id ||
          !interactionRef.current.isDragging
        )
          return;
        console.log("here");

        redrawPreviousShapes(
          ctx,
          currentState.drawnShapes,
          currentSelected,
          currentSelected.id,
        );

        return;
      }
      if (!interactionRef.current.isDrawing) return;

      console.log(currentState.toolState.currentTool);
      if (tool === "TEXT") {
        return;
      } else if (tool === "PENCIL") {
        console.log("updating pencil");
        canvasDispatch({
          type: "UPDATE_PENCIL",
          payload: currPos,
        });
      } else {
        redrawPreviousShapes(
          ctx,
          currentState.drawnShapes,
          createNewShape(
            currentState.toolState,
            interactionRef.current.startPos,
            currPos,
          ),
          currentSelected?.id,
        );
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const currentSelected = selectedShapeRef.current;
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;
      console.log(tool);
      const currPos = getMousePos(e);

      if (tool === "PENCIL") {
        console.log("up");
        interactionRef.current.isDrawing = false;
        canvasDispatch({
          type: "FINISH_SHAPE",
          payload: createNewShape(
            currentState.toolState,
            interactionRef.current.startPos,
            currPos,
          ),
        });
        return;
      }
      if (tool === "SELECT" && currentSelected) {
        const dragState = createDragState();
        if (interactionRef.current.isDragging) {
          canvasDispatch({
            type: "UPDATE",
            payload: {
              shape: createDraggedShape(dragState, currPos, currentSelected),
            },
          });
          setSelectedShape(
            createDraggedShape(dragState, currPos, currentSelected),
          );
          console.log(
            "drag",
            createDraggedShape(dragState, currPos, currentSelected),
          );
        } else if (interactionRef.current.isResizing) {
          const resizeState = createResizeState();
          canvasDispatch({
            type: "UPDATE",
            payload: {
              shape: createResizedShape(resizeState, currPos, currentSelected),
            },
          });
          setSelectedShape(
            createResizedShape(resizeState, currPos, currentSelected),
          );
        }
      }
      interactionRef.current.isDragging = false;
      interactionRef.current.isResizing = false;

      if (!interactionRef.current.isDrawing) return;

      console.log("adding a shape");
      dispatchWithSocket({
        type: "ADD_SHAPE",
        payload: createNewShape(
          currentState.toolState,
          interactionRef.current.startPos,
          currPos,
        ),
      });
      interactionRef.current.isDrawing = false;
    };

    redrawPreviousShapes(
      ctx,
      canvasState.drawnShapes,
      selectedShape ? selectedShape : undefined,
      selectedShape ? selectedShape.id : undefined,
    );
    console.log(canvasState.drawnShapes);

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", handleResize);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
};

export default useCanvasInteraction;
