import { act, HTMLAttributes, RefObject } from "react";

export interface ResizableDivProps extends HTMLAttributes<HTMLDivElement> {
  minHeight?: number;
  minWidth?: number;
  childRef: RefObject<HTMLDivElement | null>;
  pos: { top?: number; left?: number; right?: number; bottom?: number };
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}
export type Payload = {
  event?: MouseEvent;
  rect?: DOMRect;
  pos?: { top: number; left: number };
  initialPos?: ResizableDivProps["pos"];
};
export type State = {
  pos: { top: number; left: number };
  dimensions: { width: number; height: number };
  minDimensions: { width: number; height: number };
  maxDimensions: { width: number; height: number };
};
export type Action =
  | { type: "UPDATE_TOP"; payload: Payload }
  | { type: "MOUSEDOWN_TOP"; payload: Payload }
  | { type: "MOUSEMOVE_TOP"; payload: Payload }
  | { type: "MOUSEDOWN_RIGHT"; payload: Payload }
  | { type: "MOUSEMOVE_RIGHT"; payload: Payload }
  | { type: "MOUSEDOWN_BOTTOM"; payload: Payload }
  | { type: "MOUSEMOVE_BOTTOM"; payload: Payload }
  | { type: "MOUSEDOWN_LEFT"; payload: Payload }
  | { type: "MOUSEMOVE_LEFT"; payload: Payload }
  | { type: "SET_MIN_MAX_DIMENSION"; payload: Payload }
  | { type: "ADJUST_POS"; payload: Payload };

export function reducer(state: State, action: Action): State {
  console.log(state);
  let e;
  let rect;
  let newHeight: number, newWidth: number;
  switch (action.type) {
    case "UPDATE_TOP":
      return state;
    case "MOUSEDOWN_TOP":
      rect = action.payload.rect;
      if (!rect) return state;

      return {
        ...state,
        pos: { top: rect.top, left: rect.left },
        dimensions: { width: rect.width, height: rect.height },
      };

    case "MOUSEMOVE_TOP":
      e = action.payload.event;
      if (!e) return state;
      const deltaTop = state.pos.top - e.clientY;
      newHeight = state.dimensions.height + deltaTop;
      if (
        newHeight < state.minDimensions.height ||
        newHeight > state.maxDimensions.height
      )
        return state;
      return {
        ...state,
        pos: { ...state.pos, top: e.clientY },
        dimensions: { ...state.dimensions, height: newHeight },
      };

    case "MOUSEDOWN_RIGHT":
      rect = action.payload.rect;

      if (!rect) return state;

      return {
        ...state,
        pos: { top: rect.top, left: rect.left },
        dimensions: { width: rect.width, height: rect.height },
      };

    case "MOUSEMOVE_RIGHT":
      e = action.payload.event;

      if (!e) return state;
      newWidth = e.clientX - state.pos.left;
      if (
        newWidth < state.minDimensions.width ||
        newWidth > state.maxDimensions.width
      )
        return state;
      return {
        ...state,
        dimensions: { ...state.dimensions, width: newWidth },
      };

    case "MOUSEDOWN_BOTTOM":
      rect = action.payload.rect;

      if (!e) return state;
      if (!rect) return state;

      return {
        ...state,
        pos: { top: rect.top, left: rect.left },
        dimensions: { width: rect.width, height: rect.height },
      };

    case "MOUSEMOVE_BOTTOM":
      e = action.payload.event;

      if (!e) return state;

      newHeight = e.clientY - state.pos.top;
      if (
        newHeight < state.minDimensions.height ||
        newHeight > state.maxDimensions.height
      )
        return state;
      return {
        ...state,
        dimensions: { ...state.dimensions, height: newHeight },
      };

    case "MOUSEDOWN_LEFT":
      rect = action.payload.rect;

      if (!rect) return state;

      return {
        ...state,
        pos: { top: rect.top, left: rect.left },
        dimensions: { width: rect.width, height: rect.height },
      };

    case "MOUSEMOVE_LEFT":
      e = action.payload.event;
      if (!e) return state;

      const deltaLeft = state.pos.left - e.clientX;
      newWidth = state.dimensions.width + deltaLeft;
      if (
        newWidth < state.minDimensions.width ||
        newWidth > state.maxDimensions.width
      )
        return state;

      return {
        ...state,
        pos: { ...state.pos, left: e.clientX },
        dimensions: { ...state.dimensions, width: newWidth },
      };

    case "SET_MIN_MAX_DIMENSION":
      rect = action.payload.rect;
      if (!rect) return state;
      if (!window) return state;
      return {
        ...state,
        minDimensions: { width: rect.width, height: rect.height },
        maxDimensions: {
          width: window.screen.width / 4.5,
          height: window.screen.height / 1.5,
        },
      };

    case "ADJUST_POS": {
      const { initialPos, rect } = action.payload;
      if (!initialPos || !rect) return state;

      const newPos: { top?: number; left?: number } = {};

      // Handle top and bottom
      if (initialPos.top !== undefined) newPos.top = initialPos.top;
      if (initialPos.bottom !== undefined)
        newPos.top = window.innerHeight - initialPos.bottom - rect.height;

      // Handle left and right
      if (initialPos.left !== undefined) newPos.left = initialPos.left;
      if (initialPos.right !== undefined)
        newPos.left = window.innerWidth - initialPos.right - rect.width;

      return { ...state, pos: { ...state.pos, ...newPos } };
    }

    default:
      return state;
  }
}
