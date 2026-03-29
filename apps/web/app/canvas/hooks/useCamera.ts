import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export type Camera = { x: number; y: number; z: number };

const WORLD_LIMIT = 5000;
const PADDING = 150;
const SNAP_SPEED = 0.15;

export function useCamera(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  currentTool: string,
) {
  const [camera, setCamera] = useState<Camera>(() => {
    if (typeof window !== "undefined") {
      return {
        x: window.innerWidth / 2 - (WORLD_LIMIT / 2),
        y: window.innerHeight / 2 - (WORLD_LIMIT / 2),
        z: 1
      }
    }
    return { x: 0, y: 0, z: 1 };
  });


  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const snapRafRef = useRef<number | null>(null);
  const currentToolRef = useRef(currentTool);

  useEffect(() => {
    currentToolRef.current = currentTool;
  }, [currentTool]);

  const screenToWorld = useCallback(
    (sx: number, sy: number, cam: Camera) => ({
      x: (sx - cam.x) / cam.z,
      y: (sy - cam.y) / cam.z,
    }),
    [],
  );

  // --- SNAP BACK ---
  const applySnapBack = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setCamera((prev) => {
      const minX = canvas.width - WORLD_LIMIT * prev.z;
      const minY = canvas.height - WORLD_LIMIT * prev.z;
      const targetX = Math.min(Math.max(prev.x, minX), 0);
      const targetY = Math.min(Math.max(prev.y, minY), 0);

      const done =
        Math.abs(prev.x - targetX) < 0.1 && Math.abs(prev.y - targetY) < 0.1;

      if (done) return prev;

      return {
        ...prev,
        x: prev.x + (targetX - prev.x) * SNAP_SPEED,
        y: prev.y + (targetY - prev.y) * SNAP_SPEED,
      };
    });

    snapRafRef.current = requestAnimationFrame(applySnapBack);
  }, [canvasRef]);

  const startSnapBack = useCallback(() => {
    if (snapRafRef.current) cancelAnimationFrame(snapRafRef.current);
    snapRafRef.current = requestAnimationFrame(applySnapBack);
  }, [applySnapBack]);

  // --- PAN HANDLERS ---
  const onPanStart = useCallback((e: MouseEvent) => {
    if (currentToolRef.current !== "hand") return;
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPanMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };

      setCamera((prev) => {
        const canvas = canvasRef.current;
        if (!canvas) return prev;

        // elastic resistance at bounds
        const minX = canvas.width - WORLD_LIMIT * prev.z - PADDING;
        const maxX = PADDING;
        const minY = canvas.height - WORLD_LIMIT * prev.z - PADDING;
        const maxY = PADDING;

        const isOut =
          prev.x < minX || prev.x > maxX || prev.y < minY || prev.y > maxY;

        const friction = isOut ? 0.3 : 1;

        return {
          ...prev,
          x: prev.x + dx * friction,
          y: prev.y + dy * friction,
        };
      });
    },
    [canvasRef],
  );

  const onPanEnd = useCallback(() => {
    if (!isPanning.current) return;
    isPanning.current = false;
    startSnapBack(); // spring back if dragged past bounds
  }, [startSnapBack]);

  // --- WHEEL HANDLER ---
  const onWheel = useCallback(
    (e: WheelEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // pinch/ctrl+scroll = zoom toward cursor
        const rect = canvas.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        setCamera((prev) => {
          const delta = -e.deltaY * 0.001;
          const newZoom = Math.min(Math.max(prev.z + delta, 0.1), 5);
          return {
            x: cursorX - ((cursorX - prev.x) / prev.z) * newZoom,
            y: cursorY - ((cursorY - prev.y) / prev.z) * newZoom,
            z: newZoom,
          };
        });
      } else {
        // trackpad scroll = pan
        setCamera((prev) => {
          const canvas = canvasRef.current;
          if (!canvas) return prev;

          const minX = canvas.width - WORLD_LIMIT * prev.z - PADDING;
          const maxX = PADDING;
          const minY = canvas.height - WORLD_LIMIT * prev.z - PADDING;
          const maxY = PADDING;
          const isOut =
            prev.x < minX || prev.x > maxX || prev.y < minY || prev.y > maxY;

          const friction = isOut ? 0.3 : 1;
          return {
            ...prev,
            x: prev.x - e.deltaX * friction,
            y: prev.y - e.deltaY * friction,
          };
        });

        startSnapBack();
      }
    },
    [canvasRef, startSnapBack],
  );

  return {
    camera,
    isPanning,
    onPanStart,
    onPanMove,
    onPanEnd,
    onWheel,
    screenToWorld,
  };
}
