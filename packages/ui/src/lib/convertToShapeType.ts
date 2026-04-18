import { DrawElement, Labeltype } from "@repo/common";
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
  const { fontSize, text } = label;
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
  viewportCenterWorldX: number,
  viewportCenterWorldY: number,
): AIResultType => {
  // 1. Get the scaled width and height of the shape
  const scaledWidth = e.width * sf;
  const scaledHeight = e.height * sf;

  // 2. Base position + Screen Center - (Half of the shape's width/height)
  const startX = e.x * sf + viewportCenterWorldX - scaledWidth / 2;
  const startY = e.y * sf + viewportCenterWorldY - scaledHeight / 2;

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
      startX: startX,
      startY: startY,
      //@ts-ignore
      type: e.type,
    };
  } else {
    // 3. endX and endY are simply the start + the full scaled width/height
    const endX = startX + scaledWidth;
    const endY = startY + scaledHeight;

    return {
      id: crypto.randomUUID(),
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      strokeColor: { l: 100, c: 0, h: 0 },
      strokeWidth: e.strokeWidth,
      label: getFittedFontSize(ctx, e.label, fontFamily, e.width * sf),
      backgroundColor: { l: 100, c: 0, h: 0 },
      isDeleted: false,
      //@ts-ignore
      type: e.type,
    };
  }
};
