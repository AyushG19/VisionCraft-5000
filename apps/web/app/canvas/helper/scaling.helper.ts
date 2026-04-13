import { ExcalidrawElementSkeleton } from "@workspace/ui/components/types";

export function getScalingFactor(
  elements: ExcalidrawElementSkeleton[],
): number {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  elements.forEach((el) => {
    console.log(el);
    if (el.width) {
      minX = Math.min(el.x, minX);
      minY = Math.min(el.y, minY);
      maxX = Math.max(el.x + el.width, maxX);
      maxY = Math.max(el.y + el.height, maxY);
    }
  });
  const w = maxX - minX;
  const h = maxY - minY;

  if (w > window.innerWidth) {
    console.log(minX, minY, maxX, maxY);
    return (window.innerWidth * 0.8) / w;
  } else {
    console.log(minX, minY, maxX, maxY);
    return (window.innerHeight * 0.8) / h;
  }
}
