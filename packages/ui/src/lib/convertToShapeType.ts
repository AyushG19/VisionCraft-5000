import { DrawElement } from "@repo/common";
import { ExcalidrawElementSkeleton } from "../components/types";

export type AIResultType = Extract<
  DrawElement,
  { type: "arrow" | "rectangle" | "ellipse" | "diamond" | "text" }
>;

export const convertToShapeType = (
  e: ExcalidrawElementSkeleton,
  sf: number,
): AIResultType => {
  if (e.type === "arrow") {
    return {
      id: crypto.randomUUID(),
      points: e.points.map((coord: any) => {
        return { x: coord[0] / sf, y: coord[1] / sf };
      }),
      isDeleted: false,
      backgroundColor: { l: 100, c: 0, h: 0 },
      strokeColor: { l: 100, c: 0, h: 0 },
      strokeWidth: e.strokeWidth,
      startX: e.x / sf,
      startY: e.y / sf,
      //@ts-ignore
      type: e.type,
    };
  } else {
    return {
      id: crypto.randomUUID(),
      endX: (e.x + e.width) / sf,
      endY: (e.y + e.height) / sf,
      strokeColor: { l: 100, c: 0, h: 0 },
      strokeWidth: e.strokeWidth,
      startX: e.x / sf,
      startY: e.y / sf,
      label: e.label,
      backgroundColor: { l: 100, c: 0, h: 0 },
      isDeleted: false,
      //@ts-ignore
      type: e.type,
    };
  }
};
