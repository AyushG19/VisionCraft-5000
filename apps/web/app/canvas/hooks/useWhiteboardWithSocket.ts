"use client";
import { ToolState } from "@repo/common/toolState";
import React, { useRef, useEffect, useReducer, useState } from "react";
import oklchToCSS from "../utils/oklchToCss";
import {
  Action,
  Message,
  CanvasState,
  DragStateType,
  ResizeStateType,
} from "../types/index";
import { type ShapeType } from "@repo/common/types";
import debounce from "../utils/debounce";
import { saveCanvasState } from "../api";
import { WS_BE_URL } from "config";
import canvasReducer from "../utils/canvasReducer";
import isClickOnShape, {
  HandlePosition,
  isInsideSelectBound,
  isPointInHandle,
} from "../utils/isPointInShape";
import redrawPreviousShapes from "../utils/redrawPreviousShapes";
import resizeCanvas from "../utils/canvasResizeHelper";
import pencilIcon from "../utils/pencilIcon";
import createNewShape from "../utils/createNewShape";
import { HandleName } from "../utils/getHandles";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import {
  createDraggedShape,
  createResizedShape,
} from "../utils/createTempShapeHelper";
import { createDotPattern } from "../utils/createPatterns";
type EventType = {
  userId: string;
  type: "ADD" | "DEL" | "UPD";
  shape: ShapeType;
};

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
export const useWhiteboardWithSocket = (enabled: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const crosshairTools = ["SQUARE", "CIRCLE", "ARROW", "TRIANGLE"];
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [selectedShape, setSelectedShape] = useState<ShapeType | undefined>(
    undefined
  );
  const currMousePos = useRef({ x: 0, y: 0 });
  const [canvasState, canvasDispatch] = useReducer(canvasReducer, initState);
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
  const patternRef = useRef<CanvasPattern | null>(null);
  const debounceCanvasSave = useRef(debounce(saveCanvasState, 10000));

  const dispatchWithSocket = (action: Action) => {
    canvasDispatch(action);
    if (!wsRef.current) return;
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.log("no user Id");
      return;
    }
    if (action.type === "ADD_SHAPE") {
      let messagePayload: EventType = {
        userId: userId,
        type: "ADD",
        shape: action.payload,
      };
      wsRef.current.send(
        JSON.stringify({ type: "ADD_SHAPE", payload: messagePayload })
      );
    }
    if (action.type === "DEL_SHAPE") {
      let messagePayload = {
        userId: userId,
        type: "DEL",
        shape: action.payload,
      };
      wsRef.current.send(
        JSON.stringify({ type: "DEL_SHAPE", payload: messagePayload })
      );
    }
  };

  const handleMessage = (event: any) => {
    switch (event.type) {
      case "ADD":
        canvasDispatch({ type: "ADD_SHAPE", payload: event.shape });
        break;
      case "DEL":
        canvasDispatch({ type: "DEL_SHAPE", payload: event.shape });
        break;
      case "CHAT":
        setMessages((prev) => [...prev, event.message]);
        break;
    }
  };
  useEffect(() => {
    if (!enabled) return;
    console.log("in canvas socket");
    const token = localStorage.getItem("token");
    const roomId = localStorage.getItem("roomId");
    if (!token || !roomId) {
      alert("login with email to chat");
      return;
    }
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const ws = new WebSocket(
      `${WS_BE_URL}?token=${encodeURIComponent(token)}&roomId=${roomId}`
    );
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("opened connection");
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: { userId: userId },
        })
      );
    };
    ws.onmessage = (event) => {
      handleMessage(JSON.parse(event.data));
      console.log("Event: ", event);
    };
    ws.onerror = (err) => console.error("WS error:", err);
    ws.onclose = (ev) => {
      console.log("WS closed:", ev);
      ws.send(
        JSON.stringify({
          type: "LEAVE_ROOM",
          payload: { userId: userId },
        })
      );
    };

    return () => ws.close();
  }, [enabled]);

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
    if (!canvasRef.current) return;
    canvasDispatch({ type: "CHANGE_TOOL", payload: toolName });
  };

  const handleColorSelect = (color: { l: number; c: number; h: number }) => {
    canvasDispatch({ type: "CHANGE_COLOR", payload: color });
  };
  const handleStrokeSelect = (size: number) => {
    canvasDispatch({ type: "CHANGE_BRUSHSIZE", payload: size });
  };

  const handleRedo = () => {
    canvasDispatch({ type: "REDO" });
  };
  const handleUndo = () => {
    canvasDispatch({ type: "UNDO" });
  };

  return {
    canvasRef,
    canvasDispatch,
    dispatchWithSocket,
    handleToolSelect,
    handleColorSelect,
    handleStrokeSelect,
    handleRedo,
    handleUndo,
    canvasState,
    wsRef,
    isDrawing,
    messages,
    setMessages,
  };
};
