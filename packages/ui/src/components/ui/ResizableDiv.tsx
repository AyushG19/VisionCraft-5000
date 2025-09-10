"use client";
import React, {
  HTMLAttributes,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import ChatModal from "../ChatModal";
var MIN_HEIGHT = 0;
var MIN_WIDTH = 0;
var MAX_HEIGHT = window.screen.height / 1.5;
var MAX_WIDTH = window.screen.width / 4.5;

interface ResizableDivProps extends HTMLAttributes<HTMLDivElement> {
  minHeight: number;
  minWidth: number;
}
type Payload = {
  event?: MouseEvent;
  rect: DOMRect;
};
type State = {
  pos: { top: number; left: number };
  dimensions: { width: number; height: number };
};
type Action =
  | { type: "UPDATE_TOP"; payload: Payload }
  | { type: "MOUSEDOWN_TOP"; payload: Payload }
  | { type: "MOUSEMOVE_TOP"; payload: Payload }
  | { type: "MOUSEDOWN_RIGHT"; payload: Payload }
  | { type: "MOUSEMOVE_RIGHT"; payload: Payload }
  | { type: "MOUSEDOWN_BOTTOM"; payload: Payload }
  | { type: "MOUSEMOVE_BOTTOM"; payload: Payload }
  | { type: "MOUSEDOWN_LEFT"; payload: Payload }
  | { type: "MOUSEMOVE_LEFT"; payload: Payload };

function reducer(state: State, action: Action): State {
  const e = action.payload.event;
  if (!e) return state;
  const rect = action.payload.rect;
  let newHeight: number, newWidth: number;
  switch (action.type) {
    case "UPDATE_TOP":
      return state;
    case "MOUSEDOWN_TOP":
      return {
        pos: { top: rect.top, left: rect.left },
        dimensions: { width: rect.width, height: rect.height },
      };

    case "MOUSEMOVE_TOP":
      const deltaTop = state.pos.top - e.clientY;
      newHeight = state.dimensions.height + deltaTop;
      if (newHeight < MIN_HEIGHT || newHeight > MAX_HEIGHT) return state;
      return {
        pos: { ...state.pos, top: e.clientY },
        dimensions: { ...state.dimensions, height: newHeight },
      };

    case "MOUSEDOWN_RIGHT":
      return {
        pos: { top: rect.top, left: rect.left },
        dimensions: { width: rect.width, height: rect.height },
      };

    case "MOUSEMOVE_RIGHT":
      newWidth = e.clientX - state.pos.left;
      if (newWidth < MIN_WIDTH || newWidth > MAX_WIDTH) return state;
      return {
        ...state,
        dimensions: { ...state.dimensions, width: newWidth },
      };
    case "MOUSEDOWN_BOTTOM":
      return {
        pos: { top: rect.top, left: rect.left },
        dimensions: { width: rect.width, height: rect.height },
      };
    case "MOUSEMOVE_BOTTOM":
      newHeight = e.clientY - state.pos.top;
      if (newHeight < MIN_HEIGHT || newHeight > MAX_HEIGHT) return state;
      return {
        ...state,
        dimensions: { ...state.dimensions, height: newHeight },
      };
    case "MOUSEDOWN_LEFT":
      return {
        pos: { top: rect.top, left: rect.left },
        dimensions: { width: rect.width, height: rect.height },
      };
    case "MOUSEMOVE_LEFT":
      const deltaLeft = state.pos.left - e.clientX;
      newWidth = state.dimensions.width + deltaLeft;
      if (newWidth < MIN_WIDTH || newWidth > MAX_WIDTH) return state;

      return {
        pos: { ...state.pos, left: e.clientX },
        dimensions: { ...state.dimensions, width: newWidth },
      };
    default:
      return state;
  }
}
const ResizableDiv = (props: ResizableDivProps) => {
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const topHandleRef = useRef<HTMLDivElement | null>(null);
  const rightHandleRef = useRef<HTMLDivElement | null>(null);
  const bottomHandleRef = useRef<HTMLDivElement | null>(null);
  const leftHandleRef = useRef<HTMLDivElement | null>(null);
  const initialDivState: State = {
    pos: { top: 100, left: 100 },
    dimensions: { width: 0, height: 0 },
  };
  const [divState, dispatch] = useReducer(reducer, initialDivState);
  const isResizing = useRef<null | "TOP" | "RIGHT" | "BOTTOM" | "LEFT">(null);

  MIN_HEIGHT = props.minHeight;
  MIN_WIDTH = props.minWidth;
  const mouseDownHandle =
    (direction: "TOP" | "RIGHT" | "BOTTOM" | "LEFT") => (e: MouseEvent) => {
      isResizing.current = direction;
      const mainContainer = mainContainerRef.current;
      if (!mainContainer) return;
      const rect = mainContainer.getBoundingClientRect();
      dispatch({
        type: `MOUSEDOWN_${direction}`,
        payload: { event: e, rect: rect },
      });
    };

  const mouseMoveHandle =
    (direction: "TOP" | "RIGHT" | "BOTTOM" | "LEFT") => (e: MouseEvent) => {
      if (isResizing.current !== direction) return;
      const mainContainer = mainContainerRef.current;
      if (!mainContainer) return;
      const rect = mainContainer.getBoundingClientRect();
      dispatch({
        type: `MOUSEMOVE_${direction}`,
        payload: { event: e, rect: rect },
      });
    };

  const mouseUpHandle = (e: MouseEvent) => {
    isResizing.current = null;
  };
  //-----------------------------------------------------------//
  //                        top handle                         //
  //-----------------------------------------------------------//
  const mouseDownTopHandle = mouseDownHandle("TOP");
  const mouseMoveTopHandle = mouseMoveHandle("TOP");
  //-----------------------------------------------------------//
  //                     right handle                          //
  //-----------------------------------------------------------//
  const mouseDownRightHandle = mouseDownHandle("RIGHT");
  const mouseMoveRightHandle = mouseMoveHandle("RIGHT");
  //-----------------------------------------------------------//
  //                    bottom handle                          //
  //-----------------------------------------------------------//
  const mouseDownBottomHandle = mouseDownHandle("BOTTOM");
  const mouseMoveBottomHandle = mouseMoveHandle("BOTTOM");

  const mouseDownLeftHandle = mouseDownHandle("LEFT");
  const mouseMoveLeftHandle = mouseMoveHandle("LEFT");

  useEffect(() => {
    const mainContainer = mainContainerRef.current;
    const topHandle = topHandleRef.current;
    const rightHandle = rightHandleRef.current;
    const bottomHandle = bottomHandleRef.current;
    const leftHandle = leftHandleRef.current;
    if (
      !mainContainer ||
      !topHandle ||
      !rightHandle ||
      !bottomHandle ||
      !leftHandle
    )
      return;
    //
    topHandle.addEventListener("mousedown", mouseDownTopHandle);
    window.addEventListener("mousemove", mouseMoveTopHandle);

    //
    rightHandle.addEventListener("mousedown", mouseDownRightHandle);
    window.addEventListener("mousemove", mouseMoveRightHandle);

    //
    bottomHandle.addEventListener("mousedown", mouseDownBottomHandle);
    window.addEventListener("mousemove", mouseMoveBottomHandle);

    //
    leftHandle.addEventListener("mousedown", mouseDownLeftHandle);
    window.addEventListener("mousemove", mouseMoveLeftHandle);

    window.addEventListener("mouseup", mouseUpHandle);

    return () => {
      topHandle.removeEventListener("mousedown", mouseDownTopHandle);
      window.removeEventListener("mousemove", mouseMoveTopHandle);

      //
      rightHandle.removeEventListener("mousedown", mouseDownRightHandle);
      window.removeEventListener("mousemove", mouseMoveRightHandle);

      //
      bottomHandle.removeEventListener("mousedown", mouseDownBottomHandle);
      window.removeEventListener("mousemove", mouseMoveBottomHandle);

      //
      leftHandle.removeEventListener("mousedown", mouseDownLeftHandle);
      window.removeEventListener("mousemove", mouseMoveLeftHandle);

      window.addEventListener("mouseup", mouseUpHandle);
    };
  });

  return (
    <div
      ref={mainContainerRef}
      className="absolute top-1/2 left-1/2"
      style={{
        top: `${divState.pos.top}px`,
        left: `${divState.pos.left}px`,
        width: `${divState.dimensions.width > 0 && divState.dimensions.width}px`,
        height: `${divState.dimensions.height > 0 && divState.dimensions.height}px`,
      }}
    >
      <div className="relative w-full h-full">
        <div
          draggable="false"
          ref={topHandleRef}
          className="absolute top-0 w-full h-1 bg-red-5 cursor-n-resize"
        ></div>
        <div
          draggable="false"
          ref={rightHandleRef}
          className="absolute right-0 w-1 h-full bg-blac cursor-e-resize"
        ></div>
        <div
          draggable="false"
          ref={bottomHandleRef}
          className="absolute bottom-0 w-full h-1 bg-blue-5 cursor-s-resize"
        ></div>
        <div
          draggable="false"
          ref={leftHandleRef}
          className="absolute left-0 w-1 h-full flex-1 bg-green-5 cursor-w-resize"
        ></div>
        {props.children}
      </div>
    </div>
  );
};

export default ResizableDiv;
