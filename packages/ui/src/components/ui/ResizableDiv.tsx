"use client";
import { start } from "repl";
import {
  reducer,
  ResizableDivProps,
  State,
} from "../../utils/resizableDivReducer";
import React, { useEffect, useReducer, useRef } from "react";
import {
  IconDots,
  IconDotsVertical,
  IconGripHorizontal,
} from "@tabler/icons-react";

const ResizableDiv = (props: ResizableDivProps) => {
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const topHandleRef = useRef<HTMLDivElement | null>(null);
  const rightHandleRef = useRef<HTMLDivElement | null>(null);
  const bottomHandleRef = useRef<HTMLDivElement | null>(null);
  const leftHandleRef = useRef<HTMLDivElement | null>(null);
  const initialDivState: State = {
    pos: { top: 0, left: 0 },
    dimensions: { width: 0, height: 0 },
    minDimensions: { width: 0, height: 0 },
    maxDimensions: { width: 0, height: 0 },
  };
  const [divState, dispatch] = useReducer(reducer, initialDivState);
  const isResizing = useRef<null | "TOP" | "RIGHT" | "BOTTOM" | "LEFT">(null);
  const childRef = props.childRef;
  const initialPos = props.pos;

  // const mouseDownHandle =
  //   (direction: "TOP" | "RIGHT" | "BOTTOM" | "LEFT") => (e: MouseEvent) => {
  //     isResizing.current = direction;
  //     const mainContainer = mainContainerRef.current;
  //     if (!mainContainer) return;
  //     const rect = mainContainer.getBoundingClientRect();
  //     dispatch({
  //       type: `MOUSEDOWN_${direction}`,
  //       payload: { event: e, rect: rect },
  //     });
  //   };

  // const mouseMoveHandle =
  //   (direction: "TOP" | "RIGHT" | "BOTTOM" | "LEFT") => (e: MouseEvent) => {
  //     if (isResizing.current !== direction) return;
  //     const mainContainer = mainContainerRef.current;
  //     if (!mainContainer) return;
  //     const rect = mainContainer.getBoundingClientRect();
  //     dispatch({
  //       type: `MOUSEMOVE_${direction}`,
  //       payload: { event: e, rect: rect },
  //     });
  //   };

  // const mouseUpHandle = (direction: "TOP" | "RIGHT" | "BOTTOM" | "LEFT") =>(e: MouseEvent) => {
  //   isResizing.current = null;
  //    if (!topHandleRef.current) return;
  //   topHandleRef.current.removeEventListener("mousedown", mouseDownTopHandle);
  //     window.removeEventListener("mousemove", mouseMoveTopHandle);
  // };
  const startResize =
    (dir: "TOP" | "RIGHT" | "BOTTOM" | "LEFT") => (e: MouseEvent) => {
      if (!mainContainerRef.current) return;
      e.preventDefault();
      isResizing.current = dir;
      const rect = mainContainerRef.current.getBoundingClientRect();
      dispatch({
        type: `MOUSEDOWN_${dir}`,
        payload: { event: e, rect: rect },
      });
      const move = (moveEvent: MouseEvent) => {
        console.log("moving");
        if (isResizing.current !== dir) return;
        if (!mainContainerRef.current) return;
        const rect = mainContainerRef.current.getBoundingClientRect();
        dispatch({
          type: `MOUSEMOVE_${dir}`,
          payload: { event: moveEvent, rect: rect },
        });
      };
      const up = () => {
        console.log("up");
        isResizing.current = null;
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    };
  //-----------------------------------------------------------//
  //                        top handle                         //
  //-----------------------------------------------------------//
  // const mouseDownTopHandle = mouseDownHandle("TOP");
  // const mouseMoveTopHandle = mouseMoveHandle("TOP");
  // const mouseUpTopHandle = mouseUpHandle("TOP");
  //-----------------------------------------------------------//
  //                     right handle                          //
  //-----------------------------------------------------------//
  // const mouseDownRightHandle = mouseDownHandle("RIGHT");
  // const mouseMoveRightHandle = mouseMoveHandle("RIGHT");
  //-----------------------------------------------------------//
  //                    bottom handle                          //
  //-----------------------------------------------------------//
  // const mouseDownBottomHandle = mouseDownHandle("BOTTOM");
  // const mouseMoveBottomHandle = mouseMoveHandle("BOTTOM");
  // //-----------------------------------------------------------//
  //                      left handle                          //
  //-----------------------------------------------------------//
  // const mouseDownLeftHandle = mouseDownHandle("LEFT");
  // const mouseMoveLeftHandle = mouseMoveHandle("LEFT");

  useEffect(() => {
    if (!childRef.current) return;
    const childRect = childRef.current.getBoundingClientRect();
    dispatch({ type: "SET_MIN_MAX_DIMENSION", payload: { rect: childRect } });
    dispatch({
      type: "ADJUST_POS",
      payload: { rect: childRect, initialPos: props.pos },
    });

    if (!mainContainerRef.current) return;
    const topResize = startResize("TOP");
    const rightResize = startResize("RIGHT");
    const bottomResize = startResize("BOTTOM");
    const leftResize = startResize("LEFT");
    //
    if (topHandleRef.current) {
      topHandleRef.current.addEventListener("mousedown", topResize);
    }
    //
    if (rightHandleRef.current) {
      rightHandleRef.current.addEventListener("mousedown", rightResize);
    }

    //
    if (bottomHandleRef.current) {
      bottomHandleRef.current.addEventListener("mousedown", bottomResize);
    }

    //
    if (leftHandleRef.current) {
      leftHandleRef.current.addEventListener("mousedown", leftResize);
    }

    return () => {
      if (topHandleRef.current) {
        topHandleRef.current.removeEventListener("mousedown", topResize);
      }
      //
      if (rightHandleRef.current) {
        rightHandleRef.current.removeEventListener("mousedown", rightResize);
      }

      //
      if (bottomHandleRef.current) {
        bottomHandleRef.current.removeEventListener("mousedown", bottomResize);
      }

      //
      if (leftHandleRef.current) {
        leftHandleRef.current.removeEventListener("mousedown", leftResize);
      }
    };
  }, []);

  return (
    <div
      ref={mainContainerRef}
      className="absolute"
      style={{
        top:
          divState.pos.top !== undefined ? `${divState.pos.top}px` : undefined,
        left:
          divState.pos.left !== undefined
            ? `${divState.pos.left}px`
            : undefined,
        width:
          divState.dimensions.width > 0
            ? `${divState.dimensions.width}px`
            : undefined,
        height:
          divState.dimensions.height > 0
            ? `${divState.dimensions.height}px`
            : undefined,
      }}
    >
      <div className="relative w-full h-full">
        {props.top && (
          <div
            draggable="false"
            ref={topHandleRef}
            className="absolute top-0 w-full bg-red-5 flex items-center justify-center cursor-n-resize"
          >
            <IconDots className="-m-1.5" size={15} />
          </div>
        )}
        {props.right && (
          <div
            draggable="false"
            ref={rightHandleRef}
            className="absolute right-0 w-1 h-full flex flex-col items-center justify-center bg-blac cursor-e-resize"
          >
            <IconDotsVertical className="-m-1.5" size={15} />
          </div>
        )}
        {props.bottom && (
          <div
            draggable="false"
            ref={bottomHandleRef}
            className="absolute bottom-0 w-full h-1 flex items-center justify-center bg-blue-5 cursor-s-resize"
          >
            <IconDots className="-m-1.5" size={15} />
          </div>
        )}
        {props.left && (
          <div
            draggable="false"
            ref={leftHandleRef}
            className="absolute left-0 w-1 h-full flex-1 flex flex-col items-center justify-center bg-green-5 cursor-w-resize"
          >
            <IconDotsVertical className="-m-1" size={15} />
          </div>
        )}
        {props.children}
      </div>
    </div>
  );
};

export default ResizableDiv;
