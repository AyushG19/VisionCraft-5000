import { useCallback, useEffect, useRef, useState } from "react";
import { IconTrash, IconGripHorizontal, IconSlash } from "@tabler/icons-react";
import { AllToolTypes, DrawElement, ShapeType } from "@repo/common";

// ─── Types ────────────────────────────────────────────────────────────────────

type FillMode = "fill" | "none" | "hatch";

export type ShapeEditorState = {
  strokeColor: string;
  fillColor: string;
  fillMode: FillMode;
  strokeWidth: number;
  roundness: number;
  opacity: number;
};

type ShapeEditorPanelProps = {
  tool: AllToolTypes;
  selectedShape: DrawElement | undefined;
  onDelete: () => void;
  onChange: (state: ShapeEditorState) => void;
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
  "#2C2C2A",
  "#ffffff",
  "#888780",
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

// Which sections each tool shows
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
  roundness: 8,
  opacity: 100,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      color: "var(--color-text-tertiary)",
      marginBottom: 5,
      fontWeight: 500,
    }}
  >
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
  <div
    style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}
  >
    {QUICK_COLORS.map((c) => (
      <button
        key={c}
        onClick={() => onChange(c)}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: c,
          border:
            value === c
              ? "2px solid var(--color-text-primary)"
              : "1.5px solid var(--color-border-secondary)",
          cursor: "pointer",
          flexShrink: 0,
          transition: "transform 0.1s",
          padding: 0,
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.transform = "scale(1.2)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
        }
      />
    ))}
    {/* Custom color picker */}
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        overflow: "hidden",
        border: "1.5px solid var(--color-border-secondary)",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "200%",
          height: "200%",
          margin: "-50%",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      />
    </div>
    <span
      style={{
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        color: "var(--color-text-secondary)",
        marginLeft: 2,
      }}
    >
      {value}
    </span>
  </div>
);

const SliderRow = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = "",
  leftIcon,
  rightIcon,
}: {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
    {leftIcon}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      style={{ flex: 1, accentColor: "#7F77DD", height: 4 }}
    />
    {rightIcon}
    <span
      style={{
        fontSize: 11,
        minWidth: 28,
        textAlign: "right",
        color: "var(--color-text-secondary)",
      }}
    >
      {Math.round(value)}
      {unit}
    </span>
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
    <div
      style={{
        display: "flex",
        gap: 4,
        background: "var(--color-background-secondary)",
        borderRadius: 8,
        padding: 3,
      }}
    >
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          style={{
            flex: 1,
            padding: "3px 0",
            fontSize: 10,
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontWeight: value === m.id ? 500 : 400,
            background: value === m.id ? "#7F77DD" : "transparent",
            color: value === m.id ? "#fff" : "var(--color-text-secondary)",
            transition: "all 0.12s",
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
};

const Divider = () => (
  <div
    style={{
      borderTop: "0.5px solid var(--color-border-tertiary)",
      margin: "8px 0",
    }}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ShapeEditorPanel = ({
  tool,
  selectedShape,
  onDelete,
  onChange,
}: ShapeEditorPanelProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
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
    dragState.current.on = true;
    const r = panelRef.current!.getBoundingClientRect();
    dragState.current.ox = e.clientX - r.left;
    dragState.current.oy = e.clientY - r.top;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current.on || !panelRef.current) return;
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
    <div style={{ width: 210 }}>
      {/* ── Drag handle ── */}
      <div
        onMouseDown={onHandleMouseDown}
        onTouchStart={onHandleTouchStart}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "grab",
          paddingBottom: 8,
          marginBottom: 8,
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          userSelect: "none",
        }}
      >
        <IconGripHorizontal size={14} color="var(--color-text-tertiary)" />
        <span
          style={{
            fontSize: 10,
            color: "var(--color-text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          properties
        </span>
        <span
          style={{
            fontSize: 10,
            background: "#EEEDFE",
            color: "#534AB7",
            borderRadius: 5,
            padding: "2px 6px",
            fontWeight: 500,
          }}
        >
          {TOOL_LABEL[tool] ?? tool}
        </span>
      </div>

      {/* ── Stroke color ── */}
      {caps.stroke && (
        <div style={{ marginBottom: 10 }}>
          <SectionLabel>stroke color</SectionLabel>
          <ColorSwatches
            value={editorState.strokeColor}
            onChange={(c) => update({ strokeColor: c })}
          />
        </div>
      )}

      {/* ── Stroke width ── */}
      {caps.stroke && (
        <div style={{ marginBottom: 10 }}>
          <SectionLabel>stroke width</SectionLabel>
          <SliderRow
            min={1}
            max={16}
            value={editorState.strokeWidth}
            onChange={(v) => update({ strokeWidth: v })}
            leftIcon={
              <IconSlash
                size={10}
                style={{ opacity: 0.4 }}
                color="var(--color-text-primary)"
              />
            }
            rightIcon={
              <IconSlash
                size={14}
                style={{ opacity: 0.8 }}
                color="var(--color-text-primary)"
              />
            }
          />
        </div>
      )}

      {/* ── Fill ── */}
      {caps.fill && (
        <>
          <Divider />
          <div style={{ marginBottom: 10 }}>
            <SectionLabel>fill</SectionLabel>
            <FillToggle
              value={editorState.fillMode}
              onChange={(m) => update({ fillMode: m })}
            />
            {editorState.fillMode !== "none" && (
              <div style={{ marginTop: 8 }}>
                <ColorSwatches
                  value={editorState.fillColor}
                  onChange={(c) => update({ fillColor: c })}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Roundness ── */}
      {caps.roundness && (
        <>
          <Divider />
          <div style={{ marginBottom: 10 }}>
            <SectionLabel>roundness</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  border: "2px solid #7F77DD",
                  borderRadius: editorState.roundness,
                  flexShrink: 0,
                  transition: "border-radius 0.12s",
                }}
              />
              <input
                type="range"
                min={0}
                max={60}
                step={1}
                value={editorState.roundness}
                onChange={(e) => update({ roundness: +e.target.value })}
                style={{ flex: 1, accentColor: "#7F77DD", height: 4 }}
              />
              <span
                style={{
                  fontSize: 11,
                  minWidth: 22,
                  textAlign: "right",
                  color: "var(--color-text-secondary)",
                }}
              >
                {Math.round(editorState.roundness)}
              </span>
            </div>
          </div>
        </>
      )}

      {/* ── Opacity ── */}
      <Divider />
      <div style={{ marginBottom: 10 }}>
        <SectionLabel>opacity</SectionLabel>
        <SliderRow
          min={0}
          max={100}
          value={editorState.opacity}
          onChange={(v) => update({ opacity: v })}
          unit="%"
        />
      </div>

      {/* ── Delete ── */}
      <Divider />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onDelete}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "#E24B4A",
            background: "none",
            border: "0.5px solid #F09595",
            borderRadius: 6,
            padding: "3px 9px",
            cursor: "pointer",
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#FCEBEB")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "none")
          }
        >
          <IconTrash size={11} />
          delete
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop floating panel ── */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: pos.y,
          left: pos.x,
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: 14,
          padding: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          zIndex: 100,
          display: "block",
        }}
        className="shape-editor-panel hidden sm:block"
      >
        {panelContent}
      </div>

      {/* ── Mobile FAB ── */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: "#7F77DD",
          border: "none",
          color: "#fff",
          fontSize: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          boxShadow: "0 4px 16px rgba(127,119,221,0.35)",
        }}
        className="sm:hidden"
      >
        ✦
      </button>

      {/* ── Mobile bottom sheet ── */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: 12,
            right: 12,
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: 14,
            padding: 10,
            zIndex: 200,
            boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
          }}
          className="sm:hidden"
        >
          {panelContent}
        </div>
      )}
    </>
  );
};

export default ShapeEditorPanel;
