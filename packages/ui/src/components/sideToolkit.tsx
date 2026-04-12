"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  IconTrash,
  IconGripHorizontal,
  IconSlash,
  IconMinus,
  IconCircleCaretLeft,
  IconCaretLeft,
  IconCaretRightFilled,
  IconCaretLeftFilled,
  IconLineDotted,
  IconLineDashed,
  IconLine,
  IconMinusVertical,
} from "@tabler/icons-react";
import { AllToolTypes, DrawElement, ShapeType } from "@repo/common";
import { Button } from "./ui/button";
import ThemeSwitcher from "./ThemeSwitcher";

// ─── Types ────────────────────────────────────────────────────────────────────

type FillMode = "fill" | "none" | "hatch";

export type ShapeEditorState = {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roundness: number;
  opacity: number;
};

type ShapeEditorPanelProps = {
  tool: AllToolTypes;
  selectedShape: DrawElement | undefined;
  onDelete: () => void;
  onChange: (state: ShapeEditorState) => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  theme: string;
  setTheme: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_COLORS = [
  "#E24B4A",
  "#EF9F27",
  "#639922",
  "#1D9E75",
  "#378ADD",
  "#7F77DD",
  "#D4537E",
];

const TOOL_LABEL: Partial<Record<AllToolTypes, string>> = {
  rectangle: "rect",
  ellipse: "ellipse",
  diamond: "diamond",
  line: "line",
  arrow: "arrow",
  pencil: "pencil",
  text: "text",
  image: "image",
};

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

const DEFAULT_STATE: ShapeEditorState = {
  strokeColor: "#7F77DD",
  fillColor: "#EEEDFE",
  fillMode: "fill",
  strokeWidth: 2,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs tracking-[0.07em] text-global-shadow font-medium capitalize ">
    {children}
  </p>
);

const ColorSwatches = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) => (
  <div className="flex items-center flex-wrap">
    {QUICK_COLORS.map((c) => (
      <button
        key={c}
        onClick={() => onChange(c)}
        className="w-5 h-5 rounded-sm outline-1 outline-global-shadow cursor-pointer shrink-0 transition-transform duration-75 hover:scale-100 scale-80"
        style={{ background: c }}
      />
    ))}
    {/* Custom color picker */}
    <IconMinusVertical className="-mx-1" stroke={1} />
    <div className="w-[18px] h-[18px] rounded-full overflow-hidden border-[1.5px] border-[var(--color-border-secondary)] shrink-0 relative ">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  <div className="flex items-center py-2 ">
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

const FillToggle = ({
  value,
  onChange,
}: {
  value: FillMode;
  onChange: (m: FillMode) => void;
}) => {
  const modes: { id: FillMode; label: string }[] = [
    { id: "fill", label: "fill" },
    { id: "none", label: "none" },
    { id: "hatch", label: "hatch" },
  ];
  return (
    <div className="flex gap-4 bg-primary rounded-lg p-1">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={[
            "flex-1 py-[3px] text-[10px] rounded-md border-none cursor-pointer transition-all duration-[120ms]",
            value === m.id
              ? "font-medium bg-[#7F77DD] text-white"
              : "font-normal bg-transparent text-[var(--color-text-secondary)]",
          ].join(" ")}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
};

const Divider = () => (
  <div className="border-t-[0.5px] border-[var(--color-border-tertiary)] my-2" />
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ShapeEditorPanel = ({
  tool,
  selectedShape,
  onDelete,
  onChange,
  panelRef,
  theme,
  setTheme,
}: ShapeEditorPanelProps) => {
  const dragState = useRef({ on: false, ox: 0, oy: 0 });
  const [pos, setPos] = useState({ x: 16, y: 80 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editorState, setEditorState] =
    useState<ShapeEditorState>(DEFAULT_STATE);

  const activeTool = selectedShape?.type || tool;
  const caps = TOOL_CAPS[activeTool] ?? {
    stroke: false,
    fill: false,
    roundness: false,
  };

  const update = useCallback(
    (partial: Partial<ShapeEditorState>) => {
      setEditorState((prev) => {
        const next = { ...prev, ...partial };
        onChange(next);
        return next;
      });
    },
    [onChange],
  );

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
      {/* <IconGripHorizontal size={14} color="var(--color-text-tertiary)" /> */}

      {/* <span className="text-[10px] bg-[#EEEDFE] text-[#534AB7] rounded-[5px] px-[6px] py-[2px] font-medium">
        {TOOL_LABEL[tool] ?? tool}
      </span> */}

      {/* ── Stroke color ── */}
      {caps.stroke && (
        <div className="flex flex-col gap-1.5 w-full cursor-default">
          <SectionLabel>stroke</SectionLabel>
          <div className="bg-secondary gap-1 rounded-sm p-1.5 flex flex-col w-full">
            <ColorSwatches
              value={editorState.strokeColor}
              onChange={(c) => update({ strokeColor: c })}
            />
          </div>
        </div>
      )}

      {/* ── Fill ── */}
      {caps.fill && (
        <div className="flex flex-col w-full gap-1.5 rounded-sm cursor-default">
          {/* <SectionLabel>fill</SectionLabel> */}
          {/* <FillToggle
              value={"none"}
              onChange={(m) => update({ fillMode: m })}
            /> */}
          <SectionLabel>background</SectionLabel>
          {editorState.fillMode !== "none" && (
            <div className="bg-secondary p-1.5 rounded-sm w-full">
              <ColorSwatches
                value={editorState.fillColor}
                onChange={(c) => update({ fillColor: c })}
              />
            </div>
          )}
        </div>
      )}

      {/* ──  stroke width ── */}
      {caps.stroke && (
        <div className="w-full flex flex-col items-center bg- rounded-sm text-global-shadow gap-1.5 cursor-default">
          <div className="w-full flex items-center justify-between">
            <SectionLabel>stroke width</SectionLabel>
            <span className="text-[10px] font-semibold bg-primary px-1 py-0.5 w-fit h-fit text-center rounded-sm text-global-shadow">
              {16}
            </span>
          </div>
          <SliderRow
            min={1}
            max={16}
            value={editorState.opacity}
            onChange={(v) => update({ opacity: v })}
          />
        </div>
      )}

      {
        <div className=" cursor-default">
          <SectionLabel>stroke style</SectionLabel>
          <div className="w-full mt-1.5 flex gap-1">
            <Button variant={"secondary"} size={"sm"}>
              <IconMinus />
            </Button>
            <Button variant={"secondary"} size={"sm"}>
              <IconLineDashed />
            </Button>
            <Button variant={"secondary"} size={"sm"}>
              <IconLineDotted />
            </Button>
          </div>
        </div>
      }
      {/* ── Roundness ── */}

      {/* {caps.roundness && (
        <>
          <Divider />
          <div className="mb-[10px]">
            <SectionLabel>roundness</SectionLabel>
            <div className="flex items-center gap-2">
              {/* border-radius preview box — dynamic value, must stay inline 
              <div
                className="w-[26px] h-[26px] border-2 border-[#7F77DD] shrink-0 transition-[border-radius] duration-[120ms]"
                style={{ borderRadius: editorState.roundness }}
              />
              <input
                type="range"
                min={0}
                max={60}
                step={1}
                value={editorState.roundness}
                onChange={(e) => update({ roundness: +e.target.value })}
                className="flex-1 h-1 accent-[#7F77DD]"
              />
              <span className="text-[11px] min-w-[22px] text-right text-[var(--color-text-secondary)]">
                {Math.round(editorState.roundness)}
              </span>
            </div>
          </div>
        </>
      )} */}

      {/* ── Opacity ── */}
      {/* <Divider />
      <div className="mb-[10px]">
        <SectionLabel>opacity</SectionLabel>
        <SliderRow
          min={0}
          max={100}
          value={editorState.opacity}
          onChange={(v) => update({ opacity: v })}
          unit="%"
        />
      </div> */}

      {/* ── options ── */}
      <div className=" cursor-default">
        <SectionLabel>options</SectionLabel>
        <Button
          variant={"destructive"}
          size={"icon"}
          onClick={onDelete}
          className="w-8 h-8 mt-1.5 flex items-center gap-1 rounded-md cursor-pointer transition-colors duration-100 text-primary-contrast"
        >
          <IconTrash size={15} />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 cursor-default">
        <SectionLabel>themes</SectionLabel>
        <ThemeSwitcher theme={theme} setTheme={setTheme}></ThemeSwitcher>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop floating panel ── */}
      <div

      // className="hidden sm:block fixed z-[100] items-center rounded-lg justify-between outline-1 outline-global-shadow select-none shadow-shinyprimary shape-editor-panel bg-primary p-1 cursor-grab"
      >
        {panelContent}
      </div>

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
