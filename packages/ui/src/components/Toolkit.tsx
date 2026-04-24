"use client";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ToolIcon } from "./ui/ToolIcon";
import {
  Icon,
  IconGripVertical,
  IconLine,
  IconPhoto,
  IconProps,
  IconSend,
  IconSquareRotated,
  IconTextSize,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCircle,
  IconPencilMinus,
  IconSquare,
  IconTrendingUp,
  IconHandStop,
  IconDroplet,
  IconEraser,
} from "@tabler/icons-react";
import {
  type ToolKitType,
  type AllToolTypes,
  type ColorType,
} from "@repo/common";
import { Button } from "./ui/button";
import oklchToCSS from "../utils/colorHelper";

const tools: {
  id: AllToolTypes;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
}[] = [
  { id: "select" as const, icon: IconSend, label: "select" },
  { id: "hand" as const, icon: IconHandStop, label: "hand" },
  { id: "ellipse" as const, icon: IconCircle, label: "circle" },
  { id: "rectangle" as const, icon: IconSquare, label: "square" },
  { id: "diamond" as const, icon: IconSquareRotated, label: "diamond" },
  { id: "line" as const, icon: IconLine, label: "line" },
  { id: "arrow" as const, icon: IconTrendingUp, label: "arrow" },
  { id: "pencil" as const, icon: IconPencilMinus, label: "pencil" },
  { id: "eraser" as const, icon: IconEraser, label: "eraser" },
  { id: "text" as const, icon: IconTextSize, label: "text" },
  { id: "image" as const, icon: IconPhoto, label: "image" },
  { id: "color" as const, icon: IconDroplet, label: "color" },
];

type toolkitProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  toolKitState: ToolKitType;
  handleToolSelect: (toolname: AllToolTypes) => void;
  handleColorSelect: (color: ColorType) => void;
  currentColor: ColorType;
  handleUndo: () => void;
  handleRedo: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const Toolkit = React.forwardRef<HTMLInputElement, toolkitProps>(
  ({
    canvasRef,
    toolKitState,
    handleToolSelect,
    handleColorSelect,
    currentColor,
    handleUndo,
    handleRedo,
    inputRef,
  }) => {
    const toolkitRef = useRef<HTMLDivElement | null>(null);
    const toolIconRef = useRef<HTMLDivElement | null>(null);
    const resizeRef = useRef<any | null>(null);
    const posRef = useRef({ x: 0, y: 0 });

    // const [currPos, setCurrPos] = useState(null);
    const [currWidth, setCurrWidth] = useState(0);
    const [maxWidth, setMaxWidth] = useState(0);

    const dragState = useRef<{
      isDraging: boolean;
      dragX: number;
      dragY: number;
    }>({ isDraging: false, dragX: 0, dragY: 0 });

    const resizeState = useRef<{
      isResizing: boolean;
      initialX: number;
      initialWidth: number;
    }>({
      isResizing: false,
      initialX: 0,
      initialWidth: 0,
    });

    // if (!currPos) return null;

    const getMousePos = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // Calculate max width on mount
    useLayoutEffect(() => {
      if (!toolkitRef.current || !toolIconRef.current) return;

      toolkitRef.current.style.width = "auto";
      const naturalWidth = toolkitRef.current.scrollWidth;
      setMaxWidth(naturalWidth);
      setCurrWidth(naturalWidth);

      const x = window.innerWidth / 2 - naturalWidth / 2;
      const y = 0;
      posRef.current = { x, y };
      // const calculateMaxWidth = () => {
      //   if (!toolkitRef.current || !toolIconRef.current) return;
      //   const windowWidth = window.innerWidth;
      //   // const windowHeight = window.innerHeight;
      //   const toolIconContainer = toolIconRef.current;
      //   const naturalWidth = toolIconContainer.scrollWidth;

      //   const totalMaxWidth = naturalWidth + 12 + 16 + 4;

      //   setMaxWidth(totalMaxWidth);
      //   setCurrWidth(totalMaxWidth);

      //   // Center the toolkit
      //   const newX = windowWidth / 2 - totalMaxWidth / 2;
      //   setCurrPos({ x: Math.max(0, newX), y: 0 });
      // };

      // calculateMaxWidth();
      toolkitRef.current.style.transform = `translate(${x}px,${y}px)`;
      // toolkitRef.current.style.top = `${y}px`;
    }, []);

    const onMouseDown = useCallback(
      (e: MouseEvent) => {
        if (!toolkitRef.current) return;

        // const { x, y } = getMousePos(e);

        if (e.target !== resizeRef.current) {
          // dragState.current.isDraging = true;
          // const rect = toolkitRef.current.getBoundingClientRect();
          dragState.current = {
            isDraging: true,
            dragX: e.clientX - posRef.current.x,
            dragY: e.clientY - posRef.current.y,
          };
        } else if (e.target === resizeRef.current) {
          resizeState.current = {
            isResizing: true,
            initialX: e.clientX,
            initialWidth: currWidth,
          };
        }
      },
      [currWidth],
    );

    const onMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!toolkitRef.current) return;
        // const { x, y } = getMousePos(e);

        if (dragState.current.isDraging) {
          const newX = e.clientX - dragState.current.dragX;
          const newY = e.clientY - dragState.current.dragY;

          const width = toolkitRef.current.clientWidth;
          const height = toolkitRef.current.clientHeight;

          const x = Math.max(0, Math.min(newX, window.innerWidth - width));
          const y = Math.max(0, Math.min(newY, window.innerHeight - height));

          toolkitRef.current.style.transform = `translate(${x}px, ${y}px)`;
          posRef.current = { x, y };
        } else if (resizeState.current.isResizing) {
          // Define these as constants at the top of the component (or outside it)
          const ITEM_CHUNK = 36 + 8; // w-9 (36px) + gap-2 (8px)
          const LEFT_PAD = 12; // p-3
          const GRIP_WIDTH = 16; // w-4 (16px) + ml-1.5 (6px)
          const CHROME = LEFT_PAD + GRIP_WIDTH;

          const snapToColumns = (rawWidth: number) => {
            const available = rawWidth - CHROME;
            const cols = Math.max(1, Math.round(available / ITEM_CHUNK));
            return cols * ITEM_CHUNK + CHROME;
          };
          const deltaX = e.clientX - resizeState.current.initialX;
          const rawWidth = resizeState.current.initialWidth + deltaX;

          // Clamp between 1-column min and full-row max
          const minWidth = 1 * ITEM_CHUNK + CHROME;
          const clamped = Math.max(minWidth, Math.min(rawWidth, maxWidth));

          // Snap to the nearest whole column count — no leftover space
          setCurrWidth(snapToColumns(clamped));
          // const deltaX = x - resizeState.current.initialX;
          // const newWidth = resizeState.current.initialWidth + deltaX;

          // // Constrain width between minimum (62px) and maximum (one row width)
          // const constrainedWidth = Math.max(62, Math.min(newWidth, maxWidth));
          // const clampedConstrainedWidth =
          //   constrainedWidth - (constrainedWidth % 30);
          // setCurrWidth(constrainedWidth);
        }
      },
      [maxWidth],
    );
    const onMouseUp = useCallback(() => {
      if (dragState.current.isDraging) {
        dragState.current.isDraging = false;
        dragState.current = {
          ...dragState.current,
          dragX: 0,
          dragY: 0,
        };
      } else if (resizeState.current.isResizing) {
        resizeState.current.isResizing = false;
      }
    }, []);

    useEffect(() => {
      const toolkit = toolkitRef.current;
      if (!toolkit) return;

      const resizer = resizeRef.current;
      if (!resizer) return;

      toolkit.addEventListener("pointerdown", onMouseDown);
      window.addEventListener("pointermove", onMouseMove, { passive: true });
      window.addEventListener("pointerup", onMouseUp);

      return () => {
        toolkit.removeEventListener("pointerdown", onMouseDown);
        window.removeEventListener("pointermove", onMouseMove);
        window.removeEventListener("pointerup", onMouseUp);
      };
    }, [currWidth, maxWidth]);

    return (
      <>
        <div
          ref={toolkitRef}
          draggable={false}
          className="p-3 pb-3.5 pr-0 absolute rounded-lg flex items-center cursor-move bg-primary outline-1 outline-global-shadow shadow-shinyprimary "
          style={{
            top: 0,
            left: 0,
            width: currWidth > 0 ? `${currWidth}px` : "auto",
            maxWidth: maxWidth > 0 ? `${maxWidth}px` : "none",
          }}
        >
          <div ref={toolIconRef} className="flex flex-wrap gap-1 lg:gap-2 mr-1">
            {tools.map((tool) => {
              return (
                <ToolIcon
                  style={{ color: oklchToCSS(currentColor) }}
                  inputRef={inputRef}
                  isSelected={toolKitState.currentTool === tool.id}
                  key={tool.id}
                  toolInfo={tool}
                  onSelectColor={handleColorSelect}
                  onSelectTool={handleToolSelect}
                  initialColor={toolKitState.currentColor}
                />
              );
            })}
            {/* <div className="h-8 w-[1px] ml-1 mt-1 bg-black"></div> */}
          </div>
          <IconGripVertical
            ref={resizeRef}
            className="cursor-e-resize w-4 h-4 shrink-0 "
          />
        </div>
        <div className="absolute right-6 bottom-6 flex">
          {["undo", "redo"].map((name, i) => (
            <Button
              key={i}
              aria-label={name}
              variant={"secondary"}
              className={`w-7 h-7 lg:w-9 lg:h-9 p-0 flex items-center justify-center cursor-pointer shadow-shinysecondary text-secondary-contrast button-press-active transition-transform ease-in-out duration-100 outline-1 outline-global-shadow ${i === 0 ? "rounded-r-none" : "rounded-l-none"}`}
              onClick={handleUndo}
            >
              {i === 0 ? (
                <IconArrowBackUp
                  className="w-[10px] h-[10px] md:w-[15px] md:h-[15px]"
                  stroke={1.6}
                />
              ) : (
                <IconArrowForwardUp
                  className="w-[10px] h-[10px] md:w-[15px] md:h-[15px]"
                  stroke={1.6}
                />
              )}
            </Button>
          ))}
        </div>
      </>
    );
  },
);

export { Toolkit, type toolkitProps };
