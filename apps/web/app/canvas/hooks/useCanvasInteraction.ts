"use client";

import React, { useEffect, useRef, useState } from "react";
import { DrawElement, PointType, ShapeType } from "@repo/common";
import { Action, CanvasState, TextEditState } from "../types";
import resizeCanvas from "../utils/canvasResizeHelper";
import redrawPreviousShapes, {
  imageCache,
} from "../utils/redrawPreviousShapes";

import useInteractionState from "./useInteractionState";
import useCanvasCursor from "./useCanvasCursor";
import useSelectInteraction from "./useSelectInteraction";
import useDrawInteraction from "./useDrawingInteraction";
import useCanvasRenderer from "./useCanvasRenderer";
import { getMousePos } from "app/lib/coordinate.helper";
import { useCamera } from "./useCamera";
import { screenToWorld } from "app/lib/math";
import { drawShape } from "../utils/drawing";
import { storeImg } from "app/services/canvas.service";
import { set } from "idb-keyval";
import { get } from "http";
import { createNewImage, createNewShape } from "../utils/createNewShape";

const useCanvasInteraction = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  canvasState: CanvasState,
  canvasDispatch: (action: Action) => void,
  dispatchWithSocket: (action: Action) => void,
  sendCursorState: (pos: PointType) => void,
  inRoom: boolean,
  setTextEdit: React.Dispatch<React.SetStateAction<TextEditState>>,
  sideToolkitRef: React.RefObject<HTMLDivElement | null>,
) => {
  const [selectedShape, setSelectedShape] = useState<DrawElement | undefined>(
    undefined,
  );

  const interactionState = useInteractionState();
  const cursor = useCanvasCursor(canvasRef);
  const { camera, onPanStart, onPanMove, onPanEnd, isPanning, onWheel } =
    useCamera(canvasRef, canvasState.toolState.currentTool);

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
    inRoom,
    camera,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const fileInput = inputRef.current;
    if (!canvas || !fileInput) {
      console.log("somethng missing:");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas(
      canvas,
      ctx,
      () =>
        redrawPreviousShapes(ctx, canvasStateRef.current.drawnShapes, camera),
      canvasStateRef.current.toolState,
    );

    const handleResize = () => {
      resizeCanvas(
        canvas,
        ctx,
        () =>
          redrawPreviousShapes(ctx, canvasStateRef.current.drawnShapes, camera),
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
          screenToWorld(pos.x, pos.y, camera),
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
      } else if (tool === "hand") {
        onPanStart(e);
      } else {
        drawInteraction.handleDrawMouseDown(
          screenToWorld(pos.x, pos.y, camera),
          currentState.toolState,
        );
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
      const currentState = canvasStateRef.current;
      const currentSelected = selectedShapeRef.current;
      const tool = currentState.toolState.currentTool;

      sendCursorState(pos);

      if (tool === "select") {
        selectInteraction.handleSelectMouseMove(
          screenToWorld(pos.x, pos.y, camera),
          ctx,
          currentSelected,
          currentState,
          camera,
        );
      } else if (tool === "hand") {
        onPanMove(e);
      } else {
        drawInteraction.handleDrawMouseMove(
          screenToWorld(pos.x, pos.y, camera),
          ctx,
          currentState.toolState,
          currentState.drawnShapes,
          currentSelected?.id,
          camera,
        );
      }

      cursor.updateCursor(
        tool,
        screenToWorld(pos.x, pos.y, camera),
        currentSelected as ShapeType,
        currentState.drawnShapes,
        isPanning.current,
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
          screenToWorld(pos.x, pos.y, camera),
          currentSelected as ShapeType,
        );
      } else if (tool === "hand") {
        onPanEnd();
      } else {
        drawInteraction.handleDrawMouseUp(
          screenToWorld(pos.x, pos.y, camera),
          currentState.toolState,
        );
      }

      redrawPreviousShapes(
        ctx,
        currentState.drawnShapes,
        camera,
        currentSelected,
        currentSelected?.id,
      );
      canvasDispatch({ type: "CHANGE_TOOL", payload: "select" });
    };

    const handleWheel = (e: WheelEvent) => {
      onWheel(e);
    };

    const handleFileInput = async () => {
      const fileList = fileInput.files;
      console.log("in file");
      if (!fileList || fileList.length === 0) return;
      console.log("file item", fileList[fileList.length - 1]);
      const lastImg = fileList[fileList.length - 1]!;

      console.log("Mime type:", lastImg.type);
      //clean data and optimize
      const worker = new Worker(
        new URL("../../worker/worker.ts", import.meta.url),
      );
      const imgBitmap = await createImageBitmap(lastImg);
      const newImage = createNewImage(
        imgBitmap.width,
        imgBitmap.height,
        camera,
        canvasState.toolState.currentColor,
        canvasState.toolState.strokeSize,
      );
      console.log("newimg", newImage);

      worker.postMessage({ imgBitmap });
      worker.onmessage = async (message) => {
        const compressedBlob = message.data;
        await set(newImage.id, compressedBlob);
        imageCache.set(newImage.id, imgBitmap);
        dispatchWithSocket({ type: "ADD_SHAPE", payload: newImage });

        if (inRoom) {
          storeImg(compressedBlob).then((res: any) => {
            const updatedShape = { ...newImage, link: res };
            dispatchWithSocket({ type: "UPD_SHAPE", payload: updatedShape });
          });
        }
      };
      // const tempUrl = URL.createObjectURL(lastImg);
      // const img = new Image();
      // img.onload = () => ctx.drawImage(img, 0, 0);
      // img.src =
      //   "http://res.cloudinary.com/dg6spymhq/image/upload/v1775821766/djv9uk6ksl2s344mnpqu.webp";
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("dblclick", handleDoubleClick);
    canvas.addEventListener("wheel", handleWheel);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", onKeyDown);
    fileInput.addEventListener("change", handleFileInput);

    redrawPreviousShapes(
      ctx,
      canvasStateRef.current.drawnShapes,
      camera,
      selectedShape,
      selectedShape?.id,
    );

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("dblclick", handleDoubleClick);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
      fileInput.removeEventListener("change", handleFileInput);
    };
  }, [inRoom, camera]);

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
