"use client";
import { ToolState } from "@repo/common/toolState";
import React, { useRef, useEffect, useReducer, useState } from "react";
import oklchToCSS from "../utils/oklchToCss";
import {
  Action,
  CanvasState,
  DragStateType,
  ResizeStateType,
} from "../types/index";
import pencilIcon from "../utils/pencilIcon";
import { type ShapeType } from "@repo/common/types";
import { drawShape } from "../utils/drawing";
import debounce from "../utils/debounce";
import { useRoomID } from "./useRoomID";
import canvasReducer from "../utils/canvasReducer";
import isClickOnShape, {
  isInsideSelectBound,
  isPointInHandle,
} from "../utils/isPointInShape";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import createNewShape from "../utils/createNewShape";
import {
  createDraggedShape,
  createResizedShape,
} from "../utils/createTempShapeHelper";
// const oklchToCSS = ({
//   l,
//   c,
//   h,
// }: {
//   l: number;
//   c: number;
//   h: number;
// }): string => {
//   return `oklch(${l} ${c} ${h})`;
// };

// function reducer(state: State, action: Action): State {
//   switch (action.type) {
//     case "INITIALIZE_BOARD":
//       return {
//         ...state,
//         drawnShapes: action.payload,
//       };
//     case "DEL_SHAPE":
//       return {
//         ...state,
//         drawnShapes: state.drawnShapes.filter(
//           (shape) => shape.id !== action.payload.id
//         ),
//       };
//     case "ADD_SHAPE":
//       const previousHistory = state.history.slice(0, state.historyIndex + 1);
//       const newCanvasState = [...state.drawnShapes, action.payload];

//       return {
//         ...state,
//         drawnShapes: newCanvasState,
//         history: [...previousHistory, newCanvasState],
//         historyIndex: previousHistory.length,
//       };
//     case "UPDATE_PENCIL":
//       const currentPos = action.payload;
//       const lastShapeIndex = state.drawnShapes.length - 1;
//       const lastShape = state.drawnShapes[lastShapeIndex];
//       if (!lastShape) return state;
//       const updatedPoints = [...(lastShape.points || []), currentPos];
//       return {
//         ...state,
//         drawnShapes: [
//           ...state.drawnShapes.slice(0, lastShapeIndex),
//           {
//             ...lastShape,
//             points: updatedPoints,
//             endX: currentPos.x,
//             endY: currentPos.y,
//           },
//         ],
//       };
//     // case "FINISH_SHAPE":
//     //   const previousHistory = state.history.slice(0, state.historyIndex + 1);
//     //   const newCanvasState = [...state.drawnShapes, action.payload];

//     //   return {
//     //     ...state,
//     //     drawnShapes: newCanvasState,
//     //     history: [...previousHistory, newCanvasState],
//     //     historyIndex: previousHistory.length,
//     //   };
//     case "REDO":
//       if (state.historyIndex < state.history.length - 1) {
//         const newIndex = state.historyIndex + 1;
//         const newState = state.history[newIndex];
//         return {
//           ...state,
//           drawnShapes: newState || [],
//           historyIndex: newIndex,
//         };
//       }
//       return state;
//     case "UNDO":
//       if (state.historyIndex > 0) {
//         const newIndex = state.historyIndex - 1;
//         const newState = state.history[newIndex];
//         return {
//           ...state,
//           drawnShapes: newState || [],
//           historyIndex: newIndex,
//         };
//       }
//       return state;
//     case "CHANGE_TOOL":
//       return {
//         ...state,
//         toolState: { ...state.toolState, currentTool: action.payload },
//       };
//     case "CHANGE_COLOR":
//       return {
//         ...state,
//         toolState: { ...state.toolState, currentColor: action.payload },
//       };
//     case "CHANGE_BRUSHSIZE":
//       return {
//         ...state,
//         toolState: { ...state.toolState, brushSize: action.payload },
//       };
//     default:
//       return state;
//   }
// }

const initState: CanvasState = {
  startPos: { x: 0, y: 0 },
  drawnShapes: [],
  history: [[]],
  historyIndex: 0,
  toolState: {
    currentTool: "SELECT",
    currentColor: { l: 0.7, c: 0.1, h: 0 },
    brushSize: 2,
  },
};
export const useWhiteBoard = (enabled: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  // const [toolState, setToolState] = useState<ToolState>({
  //   currentTool: "none",
  //   currentColor: { l: 0.7, c: 0.1, h: 0 },
  //   brushSize: 10,
  // });

  const currMousePos = useRef({ x: 0, y: 0 });
  const [selectedShape, setSelectedShape] = useState<ShapeType | undefined>(
    undefined
  );
  const dragState = useRef<DragStateType>({
    isDragging: false,
    draggedShapeId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const resizeState = useRef<ResizeStateType>({
    isResizing: false,
    resizeDirection: null,
  });
  const [canvasState, canvasDispatch] = useReducer(canvasReducer, initState);
  // const debounceCanvasSave = useRef(debounce(saveCanvasState, 10000));

  //   const drawShape = useCallback(
  //     (ctx: CanvasRenderingContext2D, shape: Shape) => {
  //       const width = shape.endX - shape.startX;
  //       const height = shape.endY - shape.startY;
  //       ctx.beginPath();
  //       ctx.strokeStyle = oklchToCSS(shape.lineColor);
  //       switch (shape.type) {
  //         case "pencil":
  //           if (shape.points && shape.points.length > 1) {
  //             ctx.beginPath();
  //             ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
  //             for (let i = 1; i < shape.points.length; i++) {
  //               ctx.lineTo(shape.points[i]!.x, shape.points[i]!.y);
  //             }
  //             ctx.stroke();
  //           }
  //           break;
  //         case "arrow":
  //           const angle = Math.atan2(height, width);
  //           ctx.beginPath();
  //           ctx.moveTo(shape.startX, shape.startY);
  //           ctx.lineTo(shape.endX, shape.endY);
  //           ctx.stroke();

  //           //Draw the arrowhead
  //           ctx.beginPath();
  //           ctx.moveTo(shape.endX, shape.endY);
  //           ctx.lineTo(
  //             shape.endX - 15 * Math.cos(angle - Math.PI / 7),
  //             shape.endY - 15 * Math.sin(angle - Math.PI / 7)
  //           );
  //           ctx.stroke();
  //           ctx.beginPath();
  //           ctx.moveTo(shape.endX, shape.endY);
  //           ctx.lineTo(
  //             shape.endX - 15 * Math.cos(angle + Math.PI / 7),
  //             shape.endY - 15 * Math.sin(angle + Math.PI / 7)
  //           );
  //           ctx.stroke();
  //           break;
  //         case "circle":
  //           const centerX = shape.startX + width / 2;
  //           const centerY = shape.startY + height / 2;
  //           const radiusX = Math.abs(width / 2);
  //           const radiusY = Math.abs(height / 2);
  //           ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  //           ctx.stroke();
  //           break;
  //         case "square":
  //           ctx.strokeRect(shape.startX, shape.startY, width, height);
  //           break;
  //         case "triangle":
  //           ctx.beginPath();
  //           ctx.moveTo(shape.endX - width / 2, shape.startY);
  //           ctx.lineTo(shape.endX - width, shape.startY + height);
  //           ctx.lineTo(shape.endX, shape.endY);
  //           ctx.closePath();
  //           ctx.stroke();
  //           break;
  //         case "redo":
  //         case "undo":
  //       }
  //     },
  //     [toolState]
  //   );

  // useEffect(() => {
  //   if (enabled && state.drawnShapes.length > 0) {
  //     const roomID = useRoomID();
  //     debounceCanvasSave.current(state.drawnShapes, roomID);
  //   }
  // }, [state.drawnShapes, enabled]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // const changeCursorStyle = (style: string) => {
    //   canvas.style.cursor = style;
    // };
    if (crosshairTools.includes(canvasState.toolState.currentTool)) {
      canvas.style.cursor = "crosshair";
    } else if (canvasState.toolState.currentTool === "PENCIL") {
      canvas.style.cursor = `url(${pencilIcon}) 3 16 ,auto`;
    } else if (
      selectedShape &&
      isInsideSelectBound(currMousePos.current, getOutlineBounds(selectedShape))
    ) {
      canvas.style.cursor = "move";
    } else {
      canvas.style.cursor = "default";
    }

    resizeCanvas(
      canvas,
      ctx,
      () => redrawPreviousShapes(ctx, canvasState.drawnShapes),
      canvasState.toolState
    );
    const handleResize = () => {
      resizeCanvas(
        canvas,
        ctx,
        () => redrawPreviousShapes(ctx, canvasState.drawnShapes),
        canvasState.toolState
      );
    };

    ctx.strokeStyle = oklchToCSS(canvasState.toolState.currentColor);

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      currMousePos.current = getMousePos(e);
      canvasState.startPos = getMousePos(e);
      if (canvasState.toolState.currentTool === "SELECT") {
        if (selectedShape) {
          if (
            isInsideSelectBound(
              currMousePos.current,
              getOutlineBounds(selectedShape)
            )
          ) {
            dragState.current = {
              isDragging: true,
              draggedShapeId: selectedShape.id,
              offsetX: currMousePos.current.x - selectedShape.startX,
              offsetY: currMousePos.current.y - selectedShape.startY,
            };
          } else if (
            isPointInHandle(
              currMousePos.current.x,
              currMousePos.current.y,
              getBoundsForHandles(selectedShape),
              undefined,
              selectedShape
            )
          ) {
            resizeState.current = {
              isResizing: true,
              resizeDirection: isPointInHandle(
                currMousePos.current.x,
                currMousePos.current.y,
                getBoundsForHandles(selectedShape),
                undefined,
                selectedShape
              ),
            };
          }
        }
        const clickedShape = canvasState.drawnShapes.find((shape: ShapeType) =>
          isClickOnShape(currMousePos.current, shape)
        );
        //helps in reclicking of same shape
        setSelectedShape(() => {
          if (
            selectedShape &&
            (isInsideSelectBound(
              currMousePos.current,
              getOutlineBounds(selectedShape)
            ) ||
              isPointInHandle(
                currMousePos.current.x,
                currMousePos.current.y,
                getBoundsForHandles(selectedShape),
                undefined,
                selectedShape
              ))
          ) {
            return selectedShape;
          } else if (clickedShape) {
            dragState.current = {
              isDragging: true,
              draggedShapeId: clickedShape.id,
              offsetX: currMousePos.current.x - clickedShape.startX,
              offsetY: currMousePos.current.y - clickedShape.startY,
            };
            return clickedShape;
          } else {
            return undefined;
          }
        });
        return;
      }

      setSelectedShape(undefined);
      isDrawing.current = true;
      if (canvasState.toolState.currentTool === "PENCIL") {
        canvasDispatch({
          type: "ADD_SHAPE",
          payload: createNewShape(canvasState, { x: 0, y: 0 }),
        });
        return;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      if (canvasState.toolState.currentTool === "SELECT") {
        let hoveredShape;
        currMousePos.current = getMousePos(e);
        if (selectedShape && dragState.current.isDragging) {
          console.log("in draggin");
          redrawPreviousShapes(
            ctx,
            canvasState.drawnShapes,
            createDraggedShape(
              dragState.current,
              currMousePos.current,
              selectedShape
            ),
            selectedShape.id
          );
          return;
        }
        if (
          selectedShape &&
          resizeState.current.isResizing &&
          resizeState.current.resizeDirection !== null
        ) {
          const resizingPayload = {
            selectedShapeId: selectedShape.id,
            currPos: currMousePos.current,
            direction: resizeState.current.resizeDirection,
          };
          console.log(resizeState);
          redrawPreviousShapes(
            ctx,
            canvasState.drawnShapes,
            createResizedShape(
              resizeState.current,
              currMousePos.current,
              selectedShape
            ),
            selectedShape.id
          );
          return;
        }
        if (selectedShape && !dragState.current.isDragging) {
          const outlineBounds = getOutlineBounds(selectedShape);
          const bounds = getBoundsForHandles(selectedShape);

          const hoveredHandle: HandleName | null = isPointInHandle(
            currMousePos.current.x,
            currMousePos.current.y,
            bounds,
            undefined,
            selectedShape
          );
          if (hoveredHandle) {
            canvas.style.cursor = handleCursors[hoveredHandle];
          } else if (isInsideSelectBound(currMousePos.current, outlineBounds)) {
            canvas.style.cursor = "move";
          } else {
            hoveredShape = canvasState.drawnShapes.find((shape: ShapeType) =>
              isClickOnShape(currMousePos.current, shape)
            );
            canvasRef.current.style.cursor = hoveredShape ? "move" : "default";
          }
        } else if (!dragState.current.isDragging) {
          hoveredShape = canvasState.drawnShapes.find((shape: ShapeType) =>
            isClickOnShape(currMousePos.current, shape)
          );
          canvasRef.current.style.cursor = hoveredShape ? "move" : "default";
        }
        if (
          !selectedShape ||
          dragState.current.draggedShapeId !== selectedShape.id ||
          !dragState.current.isDragging
        )
          return;
        console.log("here");

        redrawPreviousShapes(
          ctx,
          canvasState.drawnShapes,
          selectedShape,
          selectedShape.id
        );

        return;
      }
      if (!isDrawing.current) return;

      currMousePos.current = getMousePos(e);
      console.log(canvasState.toolState.currentTool);
      if (canvasState.toolState.currentTool === "TEXT") {
        return;
      } else if (canvasState.toolState.currentTool === "PENCIL") {
        console.log("updating pencil");
        canvasDispatch({
          type: "UPDATE_PENCIL",
          payload: currMousePos.current,
        });
      } else {
        redrawPreviousShapes(
          ctx,
          canvasState.drawnShapes,
          createNewShape(canvasState, currMousePos.current),
          selectedShape?.id
        );
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      console.log(canvasState.toolState.currentTool);
      currMousePos.current = getMousePos(e);

      if (canvasState.toolState.currentTool === "SELECT" && selectedShape) {
        if (dragState.current.isDragging) {
          canvasDispatch({
            type: "UPDATE",
            payload: {
              shape: createDraggedShape(
                dragState.current,
                currMousePos.current,
                selectedShape
              ),
            },
          });
          setSelectedShape(
            createDraggedShape(
              dragState.current,
              currMousePos.current,
              selectedShape
            )
          );
          console.log(
            "drag",
            createDraggedShape(
              dragState.current,
              currMousePos.current,
              selectedShape
            )
          );
        } else if (resizeState.current.isResizing) {
          canvasDispatch({
            type: "UPDATE",
            payload: {
              shape: createResizedShape(
                resizeState.current,
                currMousePos.current,
                selectedShape
              ),
            },
          });
          setSelectedShape(
            createResizedShape(
              resizeState.current,
              currMousePos.current,
              selectedShape
            )
          );
        }
      }
      dragState.current.isDragging = false;
      resizeState.current.isResizing = false;

      if (!isDrawing.current) return;

      console.log("adding a shape");
      dispatchWithSocket({
        type: "ADD_SHAPE",
        payload: createNewShape(canvasState, currMousePos.current),
      });
      isDrawing.current = false;
      canvasState.toolState.currentTool = "SELECT";
    };

    redrawPreviousShapes(
      ctx,
      canvasState.drawnShapes,
      selectedShape ? selectedShape : undefined,
      selectedShape ? selectedShape.id : undefined
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
  }, [canvasState, selectedShape]);

  const handleToolSelect = (toolName: ToolState["currentTool"]) => {
    console.log(toolName);
    dispatch({ type: "CHANGE_TOOL", payload: toolName });
    // setToolState((prev) => ({ ...prev, currentTool: toolName }));
    // console.log(state.toolState);
  };

  const handleColorSelect = (color: { l: number; c: number; h: number }) => {
    dispatch({ type: "CHANGE_COLOR", payload: color });
  };
  const handleStrokeSelect = (size: number) => {
    dispatch({ type: "CHANGE_BRUSHSIZE", payload: size });
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
    // if (state.historyIndex < state.history.length - 1) {
    //   const newIndex = state.historyIndex + 1;
    //   const newState = state.history[newIndex];
    //   setDrawnShapes(newState || []);
    //   setHistoryIndex(newIndex);
    // }
  };
  const handleUndo = () => {
    dispatch({ type: "UNDO" });
    // if (historyIndex > 0) {
    //   const newIndex = historyIndex - 1;
    //   const newState = history[newIndex];
    //   setDrawnShapes(newState || []);
    //   setHistoryIndex(newIndex);
    // }
  };

  return {
    canvasRef,
    dispatch,
    handleToolSelect,
    handleColorSelect,
    handleStrokeSelect,
    handleRedo,
    handleUndo,
    state,
    isDrawing,
  };
};
