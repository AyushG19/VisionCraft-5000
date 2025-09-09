"use client";
import React, { useEffect, useReducer, useRef, useState } from "react";
const MIN_HEIGHT = 100;
type Payload = {
  event?: MouseEvent;
  rect?: DOMRect;
};
type State = {
  pos: { top: number; left: number };
  dimension: { width: number; height: number };
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

function reducer(state: State, action: Action) {
  const e = action.payload.event;
  if (!e) return state;
  const rect = action.payload.rect;
  if (!rect) return state;
  switch (action.type) {
    case "UPDATE_TOP":
      return state;
    case "MOUSEDOWN_TOP":
      return {
        pos: {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
        },
        dimension: { width: rect.width, height: rect.height },
      };
    case "MOUSEMOVE_TOP":
      const newTop = e.clientY;
      const newHeight = state.dimension.height + (state.pos.top - newTop);
      if (newHeight < MIN_HEIGHT) return state;
      return {
        pos: { ...state.pos, top: newTop },
        dimension: { ...state.dimension, height: newHeight },
      };
    default:
      return state;
  }
}
const ResizableDiv = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const topHandleRef = useRef<HTMLDivElement | null>(null);
  const rightHandleRef = useRef<HTMLDivElement | null>(null);
  const bottomHandleRef = useRef<HTMLDivElement | null>(null);
  const leftHandleRef = useRef<HTMLDivElement | null>(null);
  const initialDivState: State = {
    pos: { top: 100, left: 100 },
    dimension: { width: 100, height: 100 },
  };
  const [divState, dispatch] = useReducer(reducer, initialDivState);
  const isResizing = useRef(false);

  const mouseDownTopHandle = (e: MouseEvent) => {
    isResizing.current = true;
    const mainContainer = mainContainerRef.current;
    if (!mainContainer) return;
    // const currWidth = mainContainer.getBoundingClientRect().width;
    // const currHeight = mainContainer.getBoundingClientRect().height;
    // const currX = mainContainer.getBoundingClientRect().x;
    const rect = mainContainer.getBoundingClientRect();
    dispatch({ type: "MOUSEDOWN_TOP", payload: { rect } });
  };
  const mouseMoveTopHandle = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const mainContainer = mainContainerRef.current;
    if (!mainContainer) return;
    // const currWidth = mainContainer.getBoundingClientRect().width;
    // const currHeight = mainContainer.getBoundingClientRect().height;
    // const currX = mainContainer.getBoundingClientRect().x;
    const mouseY = e.clientY;
    const rect = mainContainer.getBoundingClientRect();
    dispatch({ type: "MOUSEMOVE_TOP", payload: { event: e, rect: rect } });
  };
  const mouseUpTopHandle = (e: MouseEvent) => {
    isResizing.current = false;
  };
  const mouseDownRightHandle = (e: MouseEvent) => {};
  const mouseMoveRightHandle = (e: MouseEvent) => {};
  const mouseUpRightHandle = (e: MouseEvent) => {
    isResizing.current = false;
  };
  const mouseDownBottomHandle = (e: MouseEvent) => {};
  const mouseMoveBottomHandle = (e: MouseEvent) => {};
  const mouseUpBottomHandle = (e: MouseEvent) => {
    isResizing.current = false;
  };
  const mouseDownLeftHandle = (e: MouseEvent) => {};
  const mouseMoveLeftHandle = (e: MouseEvent) => {};
  const mouseUpLeftHandle = (e: MouseEvent) => {
    isResizing.current = false;
  };
  useEffect(() => {
    const mainContainer = mainContainerRef.current;
    const topHandle = topHandleRef.current;
    const rightHandle = rightHandleRef.current;
    const bottomHandle = bottomHandleRef.current;
    if (!mainContainer || !topHandle || !rightHandle || !bottomHandle) return;
    topHandle.addEventListener("mousedown", mouseDownTopHandle);
    window.addEventListener("mousemove", mouseMoveTopHandle);
    window.addEventListener("mouseup", mouseUpTopHandle);
    return () => {
      topHandle.removeEventListener("mousedown", mouseDownTopHandle);
      window.removeEventListener("mousemove", mouseMoveTopHandle);
      window.removeEventListener("mouseup", mouseUpTopHandle);
    };
  });

  return (
    <div
      ref={mainContainerRef}
      className="absolute top-1/2 left-1/2 w-20 h-20 bg-light_sky_blue"
      style={{
        top: `${divState.pos.top}px`,
        left: `${divState.pos.left}px`,
        width: `${divState.dimension.width}px`,
        height: `${divState.dimension.height}px`,
      }}
    >
      <div className="relative w-full h-full ">
        <span
          ref={topHandleRef}
          className="absolute top-0 w-full h-1 bg-red-500 cursor-n-resize"
        ></span>
        <span
          ref={rightHandleRef}
          className="absolute right-0 w-1 h-full bg-black"
        ></span>
        <span
          ref={bottomHandleRef}
          className="absolute bottom-0 w-full h-1 bg-blue-500"
        ></span>
        <span
          ref={leftHandleRef}
          className="absolute lefft-0 w-1 h-full flex-1 bg-green-500"
        ></span>
      </div>
    </div>
  );
};

export default ResizableDiv;
