import { IconDroplet, IconDropletFilled } from "@tabler/icons-react";
import React, { useState, useRef, useEffect, ComponentState } from "react";

interface ColorState {
  h: number;
  c: number;
  l: number;
}

interface Position {
  x: number;
  y: number;
}

interface PolarCoordinates {
  distance: number;
  angle: number;
}

interface ColorSelectorProps {
  selectedColor: { l: number; c: number; h: number };
  setSelectedColor: React.SetStateAction<ComponentState>;
}
const ColorSelector = ({
  selectedColor,
  setSelectedColor,
}: ColorSelectorProps) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const size: number = 100;
  const center: number = size / 2;
  const radius: number = center - 20;

  // Convert OKLCH to CSS color string
  const oklchToCSS = (l: number, c: number, h: number): string => {
    return `oklch(${l} ${c} ${h})`;
  };

  // Convert cartesian coordinates to polar
  const cartesianToPolar = (x: number, y: number): PolarCoordinates => {
    const dx: number = x - center;
    const dy: number = y - center;
    const distance: number = Math.sqrt(dx * dx + dy * dy);
    let angle: number = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return { distance, angle };
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement> | MouseEvent
  ): void => {
    if (!isDragging && e.type === "mousemove") return;

    if (!wheelRef.current) return;

    const rect: DOMRect = wheelRef.current.getBoundingClientRect();
    const x: number = e.clientX - rect.left;
    const y: number = e.clientY - rect.top;

    const { distance, angle }: PolarCoordinates = cartesianToPolar(x, y);

    if (distance <= radius) {
      const chroma: number = Math.min((distance / radius) * 0.3, 0.3);
      setSelectedColor({
        h: angle,
        c: chroma,
        l: selectedColor.l,
      });
    }
  };

  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e);
      const mouseUpHandler = () => handleMouseUp();

      window.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);

      return () => {
        window.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };
    }
  }, [isDragging]);

  // Generate the color wheel as a conic gradient
  const generateColorWheel = (): string => {
    const steps: number = 360;
    const colors: string[] = [];

    for (let i = 0; i < steps; i++) {
      const hue: number = i;
      colors.push(`oklch(${selectedColor.l} 0.15 ${hue})`);
    }

    return `conic-gradient(from 0deg, ${colors.join(", ")})`;
  };

  // Calculate selected color position
  const getSelectedPosition = (): Position => {
    const distance: number = (selectedColor.c / 0.3) * radius;
    const angleRad: number = ((selectedColor.h - 90) * Math.PI) / 180;
    const x: number = center + distance * Math.cos(angleRad);
    const y: number = center + distance * Math.sin(angleRad);
    return { x, y };
  };

  const selectedPosition: Position = getSelectedPosition();

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div
          ref={wheelRef}
          className="relative cursor-pointer rounded-full shadow-pressed outline-personal "
          style={{
            width: size,
            height: size,
            background: generateColorWheel(),
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Center white circle for low chroma */}
          <IconDroplet
            stroke={1}
            fill={`oklch(${selectedColor.l} ${selectedColor.c} ${selectedColor.h})`}
            className="absolute top-1/2 left-1/2 -translate-1/2 z-10"
          />

          {/* Selected color indicator */}
          <div
            className="absolute w-4 h-4 rounded-full border border-black pointer-events-none"
            style={{
              left: selectedPosition.x - 8,
              top: selectedPosition.y - 8,
              backgroundColor: oklchToCSS(
                selectedColor.l,
                selectedColor.c,
                selectedColor.h
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorSelector;
