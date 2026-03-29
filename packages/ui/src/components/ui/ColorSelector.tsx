import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';

interface ColorState {
  l: number;
  c: number;
  h: number;
}

interface Hexagon {
  q: number;
  r: number;
  x: number;
  y: number;
  color: string;
  l: number;
  c: number;
  h: number;
  id: string;
  dist: number;
}

interface ColorSelectorProps {
  setSelectedColor: React.Dispatch<React.SetStateAction<ColorState>>;
  selectedColor: ColorState;
  radius?: number;
  hexSize?: number;
  onChange?: (color: string) => void;
  className?: string;
}

export function ColorSelector({
  radius = 3,
  hexSize = 10,
  onChange,
  className = '',
  selectedColor,
  setSelectedColor
}: ColorSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Remove the stagger delay after the initial animation completes
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sync internal selected string state with the rich object on mount
  React.useEffect(() => {
    if (selectedColor && !selected) {
      // Find the closest hex, or manually construct the exact match
      const colorStr = `oklch(${selectedColor.l.toFixed(3)} ${selectedColor.c.toFixed(3)} ${selectedColor.h.toFixed(1)})`;
      setSelected(colorStr);
    }
  }, [selectedColor, selected]);

  const hexes = useMemo(() => {
    const items: Hexagon[] = [];

    // Use standard axial coordinates for a perfect macro-hexagon
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);

      for (let r = r1; r <= r2; r++) {
        // Calculate Cartesian coordinates for pointy-topped hex
        const x_norm = Math.sqrt(3) * (q + r / 2);
        const y_norm = (3 / 2) * r;

        // Hexagonal distance from center (0, 0, 0)
        const hex_dist = (Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2;

        let L = 0;
        let C = 0;
        let H = (Math.atan2(y_norm, x_norm) * 180) / Math.PI;
        if (H < 0) H += 360;

        if (hex_dist === 0) {
          // Center: Pure White
          L = 1;
          C = 0;
          H = 0;
        } else if (hex_dist === 1) {
          // Ring 1: Shades of black/gray
          // Map H to L: 0 -> 0 (black), 300 -> 0.8 (light gray)
          L = (H / 360) * 0.8;
          C = 0;
        } else {
          // Ring 2+: OKLCH Colors
          // Map distance to Lightness (lighter inside, darker outside)
          const normalizedDist = (hex_dist - 2) / Math.max(1, radius - 2);
          L = 0.85 - (normalizedDist * 0.35); // Ranges from 0.85 to 0.5 for lively/vibrant colors without deep blacks
          C = 0.35; // Vibrant colors
        }

        const color = `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
        items.push({
          q, r,
          x: x_norm, y: y_norm,
          color, l: L, c: C, h: H,
          id: `hex-${q}-${r}`,
          dist: hex_dist
        });
      }
    }
    return items;
  }, [radius]);

  const getHexPoints = (cx: number, cy: number, size: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i - 30;
      const angle_rad = (Math.PI / 180) * angle_deg;
      points.push(`${cx + size * Math.cos(angle_rad)},${cy + size * Math.sin(angle_rad)}`);
    }
    return points.join(' ');
  };

  // Calculate SVG dimensions based on the grid size
  const width = Math.sqrt(3) * hexSize * (radius * 2 + 1);
  const height = 2 * hexSize * (radius * 2 + 1) * 0.85;

  const selectedHex = hexes.find(h => h.color === selected);
  const hoveredHex = hexes.find(h => h.color === hovered);

  return (
    <div className={`inline-flex flex-col items-center gap-8 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
        className="overflow-visible drop-shadow-2xl"
      >
        {hexes.map((hex) => {
          const cx = hex.x * hexSize;
          const cy = hex.y * hexSize;
          const isSelected = selected === hex.color;
          const isHovered = hovered === hex.color;

          // Use contrasting stroke color based on lightness
          const strokeColor = hex.l > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)';

          return (
            <motion.polygon
              id={hex.id}
              key={hex.id}
              points={getHexPoints(cx, cy, hexSize - 1)}
              fill={hex.color}
              stroke={isSelected ? (hex.l > 0.5 ? '#000' : '#fff') : strokeColor}
              strokeWidth={isSelected ? 3 : 1}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isSelected ? 1.15 : (isHovered ? 1.25 : 1),
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8,
                delay: isLoaded ? 0 : hex.dist * 0.02
              }}
              onMouseEnter={() => setHovered(hex.color)}
              onMouseLeave={() => setHovered(null)}
              onPointerDown={(e) => {
                console.log("CLICK FIRED!", hex.color);
                e.preventDefault()
                setSelected(hex.color);
                onChange?.(hex.color);
                setSelectedColor({ l: hex.l, c: hex.c, h: hex.h });

              }}
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                cursor: 'pointer'
              }}
            >
              <title>{hex.color}</title>
            </motion.polygon>
          );
        })}

        {/* Bring hovered and selected to front using SVG <use> to avoid re-rendering the DOM array */}
        {selectedHex && <use href={`#${selectedHex.id}`} style={{ pointerEvents: 'none' }} />}
        {hoveredHex && hoveredHex.id !== selectedHex?.id && <use href={`#${hoveredHex.id}`} style={{ pointerEvents: 'none' }} />}
      </svg>

      {/* Selected Color Display
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: selected ? 1 : 0,
          y: selected ? 0 : 10,
          scale: selected ? 1 : 0.95
        }}
        className="flex items-center gap-4 bg-white/60 dark:bg-black/60 p-3 rounded-2xl backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-xl pointer-events-none"
      >
        <motion.div
          layoutId="color-preview"
          className="w-12 h-12 rounded-full shadow-inner border border-black/20"
          style={{ backgroundColor: selected || 'transparent' }}
        />
        <span className="font-mono text-base font-semibold text-gray-800 dark:text-gray-200 pr-4">
          {selected || 'Select a color'}
        </span> 
      </motion.div>*/}
    </div>
  );
}
