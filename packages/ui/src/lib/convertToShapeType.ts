import { DrawElement } from "@repo/common";
import { ExcalidrawElementSkeleton } from "../components/types";

export const convertToShapeType = (
  e: ExcalidrawElementSkeleton,
): DrawElement => {
  if (e.type === "arrow") {
    return {
      id: crypto.randomUUID(),
      points: e.points.map((coord: any) => {
        return { x: coord[0], y: coord[1] };
      }),
      isDeleted: false,
      backgroundColor: { l: 100, c: 0, h: 0 },
      strokeColor: { l: 100, c: 0, h: 0 },
      strokeWidth: e.strokeWidth,
      startX: e.x,
      startY: e.y,
      //@ts-ignore
      type: e.type,
    };
  } else {
    return {
      id: crypto.randomUUID(),
      endX: e.x + e.width,
      endY: e.y + e.height,
      strokeColor: { l: 100, c: 0, h: 0 },
      strokeWidth: e.strokeWidth,
      startX: e.x,
      startY: e.y,
      label: e.label,
      backgroundColor: { l: 100, c: 0, h: 0 },
      isDeleted: false,
      //@ts-ignore
      type: e.type === "diamond" ? "triangle" : e.type,
    };
  }
};
