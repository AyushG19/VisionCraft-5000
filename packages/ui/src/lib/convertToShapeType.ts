import { DrawElement, Labeltype, TextType } from "@repo/common";
import { ExcalidrawElementSkeleton } from "../components/types";

export type AIResultType = Extract<
  DrawElement,
  { type: "arrow" | "rectangle" | "ellipse" | "diamond" | "text" }
>;

function getFittedFontSize(
  ctx: CanvasRenderingContext2D,
  label: any,
  fontFamily: string,
  maxWidth: number,
): Labeltype {
  const { fontSize, text } = label; //trust me bro
  ctx.font = `${fontSize}px ${fontFamily}`;
  let newSize = fontSize;

  while (ctx.measureText(text).width + 20 > maxWidth && newSize > 1) {
    newSize--;
    ctx.font = `${newSize}px ${fontFamily}`;
  }

  return { fontSize: newSize, fontFamily: fontFamily, text: text };
}
export const convertToShapeType = (
  ctx: CanvasRenderingContext2D,
  fontFamily: string,
  e: ExcalidrawElementSkeleton,
  sf: number,
): AIResultType => {
  if (e.type === "arrow") {
    return {
      id: crypto.randomUUID(),
      points: e.points.map((coord: any) => {
        return { x: coord[0] * sf, y: coord[1] * sf };
      }),
      isDeleted: false,
      backgroundColor: { l: 100, c: 0, h: 0 },
      strokeColor: { l: 100, c: 0, h: 0 },
      strokeWidth: e.strokeWidth,
      startX: e.x * sf,
      startY: e.y * sf,
      //@ts-ignore
      type: e.type,
    };
  } else {
    return {
      id: crypto.randomUUID(),
      endX: (e.x + e.width) * sf,
      endY: (e.y + e.height) * sf,
      strokeColor: { l: 100, c: 0, h: 0 },
      strokeWidth: e.strokeWidth,
      startX: e.x * sf,
      startY: e.y * sf,
      label: getFittedFontSize(ctx, e.label, fontFamily, e.width * sf),
      backgroundColor: { l: 100, c: 0, h: 0 },
      isDeleted: false,
      //@ts-ignore
      type: e.type,
    };
  }
};
