import { useEffect } from "react";
import { type MemberCursor } from "@repo/hooks";

const useRafLoop = ({ cursorMap }: { cursorMap: MemberCursor }) => {
  useEffect(() => {
    let frameId: number;
    const cursorLoop = () => {
      const memberCursorArr = Array.from(cursorMap.entries());
      memberCursorArr.forEach((user) => {
        const el = document.getElementById(`cursor:${user[0]}`);
        if (!el) return;

        el.style.transform = `translate(${user[1].x - 20}px,${user[1].y - 3}px)`;
      });
      frameId = requestAnimationFrame(cursorLoop);
    };
    frameId = requestAnimationFrame(cursorLoop);

    return () => cancelAnimationFrame(frameId);
  }, []);
};

export default useRafLoop;
