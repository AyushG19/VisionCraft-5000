"use client";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  IconTrash,
  IconMinus,
  IconLineDotted,
  IconLineDashed,
  IconMinusVertical,
} from "@tabler/icons-react";
import {
  AllowedFonts,
  AllowedFontsArr,
  AllToolTypes,
  ColorType,
  DrawElement,
  LinearType,
  PencilType,
  ShapeType,
  TextStateType,
  TextType,
} from "@repo/common";
import { Button } from "./ui/button";
import { isShape, isStokeElement, isText } from "../utils/sideToolHelper";
// types

type FillMode = "fill" | "none" | "hatch";

export type SideToolkit = {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roundness: number;
  opacity: number;
  strokeType: "dash" | "dotted" | "normal";
};

export type SideToolkitProps = {
  tool: AllToolTypes;
  selectedShape: DrawElement | undefined;
  onDelete: () => void;
  onChange: (state: SideToolkit) => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  theme: string | undefined;
  setTheme: Dispatch<SetStateAction<string>>;
  editorState: SideToolkit;
  textState: TextStateType;
  setTextState: (partial: Partial<TextStateType>) => void;
  setEditorState: (partial: Partial<SideToolkit>) => void;
  shapeEditHelpers: {
    handleElementDelete: (element: DrawElement) => void;
    handleStrokeStyle: (
      style: "dash" | "dotted" | "normal",
      element?: ShapeType | LinearType | PencilType,
    ) => void;
    handleFillSelect: (color?: ColorType, shape?: ShapeType) => void;
    handleColorSelect: (
      color: { l: number; c: number; h: number },
      shape?: StrokeAllowedTypes,
    ) => void;
    handleStrokeSelect: (size: number, element?: StrokeAllowedTypes) => void;
    handleFontSize: (size: number, element?: TextType) => void;
    handleFontFamily: (font: AllowedFonts, element?: TextType) => void;
  };
};
type StrokeAllowedTypes = ShapeType | LinearType | PencilType;
// Constants

// const QUICK_COLORS = [
//   { l: 60, c: 93, h: 354 }, // Red
//   { l: 84, c: 90, h: 255 }, // Light Purple
//   { l: 84, c: 73, h: 162 }, // Mint Green
//   { l: 72, c: 99, h: 44 }, // Yellow
//   { l: 72, c: 92, h: 225 }, // Blue
//   { l: 80, c: 100, h: 356 }, // Pink
//   { l: 72, c: 96, h: 164 }, // Cyan
//   { l: 76, c: 80, h: 257 }, // Purple
// ];
const QUICK_COLORS = [
  { l: 0, c: 0, h: 0 },
  { l: 1, c: 0, h: 1 },
  { l: 0.6449, c: 0.2236, h: 21.34 },
  // { l: 0.9215, c: 0.0654, h: 174.39 },
  { l: 0.9336, c: 0.0657, h: 97.1 },
  { l: 0.8673, c: 0.0617, h: 270.92 },
  { l: 0.7901, c: 0.1224, h: 15.82 },
  { l: 0.9048, c: 0.1313, h: 173.43 },
  // { l: 0.7185, c: 0.1428, h: 295.61 },
  { l: 0.8047, c: 0.1032, h: 295.3 },
];
//  Sub-components

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs tracking-[0.07em] text-global-shadow font-medium capitalize">
    {children}
  </p>
);

const ColorSwatches = ({
  value,
  onOklchChange,
  selectedShape,
}: {
  value: string;
  onOklchChange: (
    c: { l: number; c: number; h: number },
    shape?: ShapeType,
  ) => void;
  selectedShape?: DrawElement;
}) => (
  <>
    {QUICK_COLORS.map((c, i) => (
      <Button
        variant={"outline"}
        key={i}
        onClick={() => {
          if (selectedShape && isShape(selectedShape.type))
            onOklchChange(c, selectedShape as ShapeType);
        }}
        className=" w-4 h-4 p-0 rounded-sm outline-1 outline-global-shadow cursor-pointer transition-transform duration-75 "
        style={{ background: `oklch(${c.l} ${c.c} ${c.h})` }}
      />
    ))}
    <IconMinusVertical className="-mx-1" stroke={1} />
    {/* Custom hex color picker — converts to oklch before calling handler */}
    <div
      className="w-4 h-4 rounded-sm overflow-hidden outline-1 outline-global-shadow relative p-0"
      style={{ background: value }}
    >
      {/* <input
        type="color"
        value={value}
        onChange={(e) => {
          // hex input can't produce a true oklch value, so we approximate
          // by passing a neutral oklch and letting the parent handle it
          // For now just log — wire up a hex→oklch util here if you have one
          console.log("hex picked:", e.target.value);
        }}
        className="border-none cursor-pointer p-0"
      /> */}
    </div>
  </>
);

const SliderRow = ({
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center py-2">
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="flex-1 h-1 bg-accent text-accent w-full hover:cursor-grab active:cursor-grab accent-accent appearance-auto overflow-hidden"
    />
  </div>
);

//-------- Main Component -----------------------------------

export const SideToolkit = ({
  tool,
  selectedShape,
  panelRef,
  textState,
  setTextState,
  editorState,
  setEditorState,
  shapeEditHelpers,
}: SideToolkitProps) => {
  const dragState = useRef({ on: false, ox: 0, oy: 0 });
  const [pos, setPos] = useState({ x: 16, y: 80 });
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [editorState, setEditorState] =
  //   useState<SideToolkit>(DEFAULT_STATE);

  const activeTool = selectedShape?.type || tool;

  // add this useEffect to sync panel state when selectedShape changes
  useEffect(() => {
    console.log("rerun -------------");
    if (!selectedShape) {
      console.log("no shape--------------");
      if (isStokeElement(tool)) {
        setEditorState({
          strokeWidth: editorState.strokeWidth,
          strokeType: editorState.strokeType ?? "normal",
          strokeColor: editorState.strokeColor,
        });
      }

      if (isText(tool)) {
        setTextState({
          fontSize: textState.fontSize,
          fontFamily: textState.fontFamily,
        });
      }
      return;
    }

    if (isStokeElement(selectedShape.type)) {
      const s = selectedShape as StrokeAllowedTypes;
      setEditorState({
        strokeWidth: s.strokeWidth,
        strokeType: s.strokeType ?? "normal",
        strokeColor: `oklch(${s.strokeColor.l} ${s.strokeColor.c} ${s.strokeColor.h})`,
      });
    }

    if (isShape(selectedShape.type)) {
      const s = selectedShape as ShapeType;
      setEditorState({
        fillColor: s.backgroundColor
          ? `oklch(${s.backgroundColor.l} ${s.backgroundColor.c} ${s.backgroundColor.h})`
          : editorState.fillColor,
      });
    }

    if (isText(selectedShape.type)) {
      const s = selectedShape as TextType;
      setTextState({
        fontSize: s.fontSize,
        fontFamily: s.fontFamily,
      });
    }
  }, [selectedShape?.id]);

  const handleStrokeColorChange = useCallback(
    (c: { l: number; c: number; h: number }) => {
      shapeEditHelpers.handleColorSelect(
        c,
        selectedShape as StrokeAllowedTypes,
      );
      setEditorState({ strokeColor: `oklch(${c.l} ${c.c} ${c.h})` });
    },
    [shapeEditHelpers, selectedShape],
  );

  const handleFillColorChange = useCallback(
    (c?: { l: number; c: number; h: number }, shape?: ShapeType) => {
      if (!c) {
        shapeEditHelpers.handleFillSelect(c, shape);
        return;
      }
      // handleFillSelect expects ColorType — pass the oklch object directly
      shapeEditHelpers.handleFillSelect(c as unknown as ColorType, shape);
      setEditorState({ fillColor: `oklch(${c.l} ${c.c} ${c.h})` });
    },
    [shapeEditHelpers, selectedShape],
  );

  const handleStrokeWidthChange = useCallback(
    (v: number) => {
      if (selectedShape && !isStokeElement(selectedShape.type)) return;
      shapeEditHelpers.handleStrokeSelect(
        v,
        selectedShape as StrokeAllowedTypes,
      );
      setEditorState({ strokeWidth: v });
    },
    [shapeEditHelpers, selectedShape],
  );

  const handleStrokeStyleChange = useCallback(
    (style: "normal" | "dash" | "dotted") => {
      if (!selectedShape) {
        setEditorState({ strokeType: style });
        return;
      }
      if (!isStokeElement(selectedShape.type)) return;
      shapeEditHelpers.handleStrokeStyle(
        style,
        selectedShape as StrokeAllowedTypes,
      );
    },
    [shapeEditHelpers, selectedShape],
  );

  const handleFontSizeSelect = useCallback(
    (size: number) => {
      if (selectedShape && !isText(selectedShape.type)) return;
      shapeEditHelpers.handleFontSize(size, selectedShape as TextType);
      setTextState({ fontSize: size });
    },
    [selectedShape],
  );

  const handleFontFamilySelect = useCallback(
    (font: AllowedFonts) => {
      if (!selectedShape) {
        setTextState({ fontFamily: font });
        return;
      }
      if (!isText(selectedShape.type)) return;
      shapeEditHelpers.handleFontFamily(font, selectedShape as TextType);
    },
    [selectedShape],
  );

  const handleElementDelete = useCallback(() => {
    if (!selectedShape) return;
    shapeEditHelpers.handleElementDelete(selectedShape);
  }, [selectedShape]);

  const getButtonCss = (style: "dash" | "dotted" | "normal"): string => {
    // shape selected — read active style from the actual shape
    if (selectedShape && isStokeElement(selectedShape.type)) {
      const s = selectedShape as StrokeAllowedTypes;
      return s.strokeType === style ? "button-press" : "";
    }
    // no shape selected — read from editorState (default styles)
    return editorState.strokeType === style ? "button-press" : "";
  };
  // ─── Drag (mouse) ────────────────────────────────────────────────────────

  const onHandleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== panelRef.current) return;
    dragState.current.on = true;
    const r = panelRef.current!.getBoundingClientRect();
    dragState.current.ox = e.clientX - r.left;
    dragState.current.oy = e.clientY - r.top;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!panelRef || !dragState.current.on || !panelRef.current) return;
      const pw = panelRef.current.offsetWidth;
      const ph = panelRef.current.offsetHeight;
      const x = Math.max(
        0,
        Math.min(e.clientX - dragState.current.ox, window.innerWidth - pw),
      );
      const y = Math.max(
        0,
        Math.min(e.clientY - dragState.current.oy, window.innerHeight - ph),
      );
      setPos({ x, y });
    };
    const onUp = () => (dragState.current.on = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ─── Drag (touch) ────────────────────────────────────────────────────────

  const onHandleTouchStart = useCallback((e: React.TouchEvent) => {
    dragState.current.on = true;
    const r = panelRef.current!.getBoundingClientRect();
    dragState.current.ox = e.touches[0]!.clientX - r.left;
    dragState.current.oy = e.touches[0]!.clientY - r.top;
  }, []);

  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (!dragState.current.on || !panelRef.current) return;
      const pw = panelRef.current.offsetWidth;
      const ph = panelRef.current.offsetHeight;
      const x = Math.max(
        0,
        Math.min(
          e.touches[0]!.clientX - dragState.current.ox,
          window.innerWidth - pw,
        ),
      );
      const y = Math.max(
        0,
        Math.min(
          e.touches[0]!.clientY - dragState.current.oy,
          window.innerHeight - ph,
        ),
      );
      setPos({ x, y });
    };
    const onEnd = () => (dragState.current.on = false);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  const panelContent = (
    <div
      ref={panelRef}
      onMouseDown={onHandleMouseDown}
      onTouchStart={onHandleTouchStart}
      className="flex max-w-[250px] flex-col gap-3 items-start justify-center select-none px-2 py-3 absolute bg-primary rounded-lg outline-1 outline-global-shadow shadow-shinyprimary cursor-move touch-none "
      style={{ top: pos.y, left: pos.x }}
    >
      {/* ── Stroke color ── */}
      {isStokeElement(activeTool) && (
        <div className="flex flex-col gap-1.5 w-full cursor-default">
          <SectionLabel>stroke color</SectionLabel>
          <div className="bg-secondary rounded-sm p-1.5 flex items-center gap-1 flex-wrap w-full">
            <ColorSwatches
              value={editorState.strokeColor}
              selectedShape={selectedShape}
              onOklchChange={handleStrokeColorChange}
            />
          </div>
        </div>
      )}

      {/* ── Fill / Background ── */}
      {isShape(activeTool) && (
        <div className="flex flex-col w-full gap-1.5 rounded-sm cursor-default">
          <SectionLabel>background</SectionLabel>
          <div className="bg-secondary flex items-center gap-1 flex-wrap p-1.5 rounded-sm w-full">
            <button
              // key={i}
              onClick={() => {
                handleFillColorChange(undefined, selectedShape as ShapeType);
                // if (selectedShape && isShape(selectedShape.type));
                // onOklchChange(c, selectedShape as ShapeType);
              }}
              className=" w-4 h-4 p-0 bg-white relative rounded-sm outline-1 outline-global-shadow cursor-pointer transition-transform duration-75 before:content-[''] before:bg-red before:top-1/2 before:left-1/2 before:absolute before:w-[1.4px] before:h-full before:rotate-45 before:-translate-1/2 "
            />
            <ColorSwatches
              value={editorState.fillColor}
              selectedShape={selectedShape}
              onOklchChange={handleFillColorChange}
            />
          </div>
        </div>
      )}

      {/* ── Stroke width ── */}
      {isStokeElement(activeTool) && (
        <div className="w-full flex flex-col items-center bg- rounded-sm text-global-shadow gap-1.5 cursor-default">
          <div className="w-full flex items-center justify-between">
            <SectionLabel>stroke width</SectionLabel>
            <span className="text-[10px] font-semibold bg-primary px-1 py-0.5 w-fit h-fit text-center rounded-sm text-global-shadow">
              {editorState.strokeWidth}
            </span>
          </div>
          <SliderRow
            min={1}
            max={16}
            value={editorState.strokeWidth}
            onChange={handleStrokeWidthChange}
          />
        </div>
      )}
      {/* Fonst style */}
      {activeTool === "text" && (
        <>
          <div className="cursor-default">
            <SectionLabel>font style</SectionLabel>
            <div className="w-full mt-1.5 flex gap-1.5">
              {AllowedFontsArr.map((f) => (
                <Button
                  key={f}
                  className={`font-${f.split(" ").join("-")}`}
                  variant={"secondary"}
                  size={"sm"}
                  onClick={() => handleFontFamilySelect(f)}
                >
                  Aa
                </Button>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col items-center bg- rounded-sm text-global-shadow gap-1.5 cursor-default">
            <div className="w-full flex items-center justify-between">
              <SectionLabel>font size</SectionLabel>
              <span className="text-[10px] font-semibold bg-primary px-1 py-0.5 w-fit h-fit text-center rounded-sm text-global-shadow">
                {textState.fontSize}
              </span>
            </div>
            <SliderRow
              min={1}
              max={50}
              value={textState.fontSize}
              onChange={handleFontSizeSelect}
            />
          </div>

          <div></div>
        </>
      )}
      {/* ── Stroke style ── */}
      {isStokeElement(activeTool) && (
        <div className="cursor-default">
          <SectionLabel>stroke style</SectionLabel>
          <div className="w-full mt-1.5 flex gap-1.5">
            <Button
              className={`button-press-active ${getButtonCss("normal")}`}
              variant={"secondary"}
              size={"sm"}
              onClick={() => handleStrokeStyleChange("normal")}
            >
              <IconMinus />
            </Button>
            <Button
              className={`button-press-active ${getButtonCss("dash")}`}
              variant={"secondary"}
              size={"sm"}
              onClick={() => handleStrokeStyleChange("dash")}
            >
              <IconLineDashed />
            </Button>
            <Button
              className={`button-press-active ${getButtonCss("dotted")}`}
              variant={"secondary"}
              size={"sm"}
              onClick={() => handleStrokeStyleChange("dotted")}
            >
              <IconLineDotted />
            </Button>
          </div>
        </div>
      )}

      {/* ── Options ── */}
      {selectedShape && (
        <div className="cursor-default">
          <SectionLabel>options</SectionLabel>
          <Button
            variant={"destructive"}
            size={"icon"}
            onClick={() => handleElementDelete()}
            className="w-8 h-8 mt-1.5 flex items-center gap-1 rounded-md cursor-pointer transition-colors duration-100 text-primary-contrast"
          >
            <IconTrash size={15} />
          </Button>
        </div>
      )}
      {/* ── Themes ── */}
      {/* <div className="flex flex-col gap-1.5 cursor-default">
        <SectionLabel>themes</SectionLabel>
        <ThemeSwitcher theme={theme ?? "default"} setTheme={setTheme} />
      </div> */}
    </div>
  );

  return selectedShape ||
    (activeTool !== "select" &&
      activeTool !== "hand" &&
      activeTool !== "color") ? (
    <>
      {/* ── Desktop floating panel ── */}

      {/* ── Mobile FAB ── */}
      {/* <button
        onClick={() => setMobileOpen((o) => !o)}
        className="sm:hidden fixed bottom-6 right-6 w-[46px] h-[46px] rounded-full bg-[#7F77DD] border-none text-white text-xl cursor-pointer flex items-center justify-center z-[200] shadow-[0_4px_16px_rgba(127,119,221,0.35)]"
      >
        ✦
      </button> */}

      {/* ── Mobile bottom sheet ── */}
      {mobileOpen ? (
        <div className="sm:hidden fixed bottom-20 left-3 right-3 bg-[var(--color-background-primary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-[14px] p-[10px] z-[200] shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
          {panelContent}
        </div>
      ) : (
        panelContent
      )}
    </>
  ) : null;
};

export default SideToolkit;
