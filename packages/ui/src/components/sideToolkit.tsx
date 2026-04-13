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
import ThemeSwitcher from "./ThemeSwitcher";
import { isShape, isStokeElement, isText } from "../utils/sideToolHelper";

// ─── Types ────────────────────────────────────────────────────────────────────

type FillMode = "fill" | "none" | "hatch";

export type ShapeEditorState = {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roundness: number;
  opacity: number;
  strokeType: "dash" | "dotted" | "normal";
};

export type ShapeEditorPanelProps = {
  tool: AllToolTypes;
  selectedShape: DrawElement | undefined;
  onDelete: () => void;
  onChange: (state: ShapeEditorState) => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  theme: string | undefined;
  setTheme: Dispatch<SetStateAction<string>>;
  editorState: ShapeEditorState;
  textState: TextStateType;
  setTextState: (partial: Partial<TextStateType>) => void;
  setEditorState: (partial: Partial<ShapeEditorState>) => void;
  shapeEditHelpers: {
    handleElementDelete: (element: DrawElement) => void;
    handleStrokeStyle: (
      style: "dash" | "dotted" | "normal",
      element?: ShapeType | LinearType | PencilType,
    ) => void;
    handleFillSelect: (color: ColorType, shape?: ShapeType) => void;
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
// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_COLORS = [
  { l: 0, c: 0, h: 0 },
  { l: 1, c: 0, h: 0 },
  { l: 0.6223, c: 0.1563, h: 131.49 },
  { l: 0.6231, c: 0.1232, h: 165.5 },
  { l: 0.6232, c: 0.1486, h: 251.5 },
  { l: 0.6232, c: 0.1502, h: 284.72 },
  { l: 0.6225, c: 0.1666, h: 2.52 },
];

const TOOL_CAPS: Record<
  string,
  { stroke: boolean; fill: boolean; roundness: boolean }
> = {
  rectangle: { stroke: true, fill: true, roundness: true },
  ellipse: { stroke: true, fill: true, roundness: false },
  diamond: { stroke: true, fill: true, roundness: false },
  line: { stroke: true, fill: false, roundness: false },
  arrow: { stroke: true, fill: false, roundness: false },
  pencil: { stroke: true, fill: false, roundness: false },
  text: { stroke: false, fill: false, roundness: false },
  image: { stroke: false, fill: false, roundness: false },
};

// const DEFAULT_STATE: ShapeEditorState = {
//   strokeColor: "oklch(0.6232 0.1502 284.72)",
//   fillColor: "oklch(0.6232 0.1502 284.72)",
//   strokeWidth: 2,
//   roundness: 0,
//   opacity: 100,
//   strokeStyle: "normal",
// };

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  <div className="flex items-center flex-wrap">
    {QUICK_COLORS.map((c, i) => (
      <button
        key={i}
        onClick={() => {
          if (selectedShape && isShape(selectedShape.type))
            onOklchChange(c, selectedShape as ShapeType);
        }}
        className="w-5 h-5 rounded-sm outline-1 outline-global-shadow cursor-pointer shrink-0 transition-transform duration-75 hover:scale-100 scale-80"
        style={{ background: `oklch(${c.l} ${c.c} ${c.h})` }}
      />
    ))}
    <IconMinusVertical className="-mx-1" stroke={1} />
    {/* Custom hex color picker — converts to oklch before calling handler */}
    <div className="w-[18px] h-[18px] rounded-full overflow-hidden border-[1.5px] border-[var(--color-border-secondary)] shrink-0 relative">
      <input
        type="color"
        value={value}
        onChange={(e) => {
          // hex input can't produce a true oklch value, so we approximate
          // by passing a neutral oklch and letting the parent handle it
          // For now just log — wire up a hex→oklch util here if you have one
          console.log("hex picked:", e.target.value);
        }}
        className="border-none cursor-pointer p-0"
      />
    </div>
  </div>
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

// ─── Main Component ───────────────────────────────────────────────────────────

export const ShapeEditorPanel = ({
  tool,
  selectedShape,
  panelRef,
  theme,
  setTheme,
  textState,
  setTextState,
  editorState,
  setEditorState,
  shapeEditHelpers,
}: ShapeEditorPanelProps) => {
  const dragState = useRef({ on: false, ox: 0, oy: 0 });
  const [pos, setPos] = useState({ x: 16, y: 80 });
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [editorState, setEditorState] =
  //   useState<ShapeEditorState>(DEFAULT_STATE);

  const activeTool = selectedShape?.type || tool;
  const caps = TOOL_CAPS[activeTool] ?? {
    stroke: false,
    fill: false,
    roundness: false,
  };

  // ─── Handlers wired to parent helpers ────────────────────────────────────

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
      if (selectedShape && !isStokeElement(selectedShape.type)) return;
      shapeEditHelpers.handleColorSelect(
        c,
        selectedShape as StrokeAllowedTypes,
      );
      setEditorState({ strokeColor: `oklch(${c.l} ${c.c} ${c.h})` });
    },
    [shapeEditHelpers, selectedShape],
  );

  const handleFillColorChange = useCallback(
    (c: { l: number; c: number; h: number }, shape?: ShapeType) => {
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
      className="flex max-w-[250px] flex-col gap-3 items-start justify-center select-none px-2 py-3 absolute bg-primary rounded-lg outline-1 outline-global-shadow shadow-shinyprimary cursor-move"
      style={{ top: pos.y, left: pos.x }}
    >
      {/* ── Stroke color ── */}
      {isStokeElement(activeTool) && (
        <div className="flex flex-col gap-1.5 w-full cursor-default">
          <SectionLabel>stroke color</SectionLabel>
          <div className="bg-secondary gap-1 rounded-sm p-1.5 flex flex-col w-full">
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
          <div className="bg-secondary p-1.5 rounded-sm w-full">
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
      <div className="flex flex-col gap-1.5 cursor-default">
        <SectionLabel>themes</SectionLabel>
        <ThemeSwitcher theme={theme ?? "default"} setTheme={setTheme} />
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop floating panel ── */}
      <div>{panelContent}</div>

      {/* ── Mobile FAB ── */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className="sm:hidden fixed bottom-6 right-6 w-[46px] h-[46px] rounded-full bg-[#7F77DD] border-none text-white text-xl cursor-pointer flex items-center justify-center z-[200] shadow-[0_4px_16px_rgba(127,119,221,0.35)]"
      >
        ✦
      </button>

      {/* ── Mobile bottom sheet ── */}
      {mobileOpen && (
        <div className="sm:hidden fixed bottom-20 left-3 right-3 bg-[var(--color-background-primary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-[14px] p-[10px] z-[200] shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
          {panelContent}
        </div>
      )}
    </>
  );
};

export default ShapeEditorPanel;
