export function createDotPattern(
  ctx: CanvasRenderingContext2D,
  radius: number = 1,
  spacing: number = 30
) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = spacing;
  patternCanvas.height = spacing;
  const pctx = patternCanvas.getContext("2d");
  pctx!.beginPath();
  pctx!.arc(spacing / 2, spacing / 2, radius, 0, Math.PI * 2);
  pctx!.fillStyle = "black";
  pctx?.fill();
  return ctx.createPattern(patternCanvas, "repeat");
}
