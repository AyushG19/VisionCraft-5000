"use client";
import { useEffect } from "react";
import { type MemberCursor } from "@repo/hooks";
import { DrawElement } from "@repo/common";

const useRafLoop = ({
  cursorMap,
  activeElementMap,
  redrawForActiveElement,
}: {
  cursorMap: MemberCursor;
  activeElementMap: Map<
    string,
    {
      isDirty: boolean;
      element: DrawElement;
      operation: "drag" | "resize";
    }
  >;
  redrawForActiveElement: (element: DrawElement) => void;
}) => {
  useEffect(() => {
    let frameId: number;
    const renderLoop = () => {
      const memberCursorArr = Array.from(cursorMap.entries());
      memberCursorArr.forEach((user) => {
        const el = document.getElementById(`cursor:${user[0]}`);
        if (!el) return;

        el.style.transform = `translate(${user[1].x - 20}px,${user[1].y - 3}px)`;
      });

      const activeElementArr = Array.from(activeElementMap.entries());

      activeElementArr.forEach((ele) => {
        if (ele[1].isDirty) {
          console.log("ele", ele);
          redrawForActiveElement(ele[1].element);
          ele[1].isDirty = false;
        }
      });
      frameId = requestAnimationFrame(renderLoop);
    };
    frameId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(frameId);
  }, []);
};

export default useRafLoop;
