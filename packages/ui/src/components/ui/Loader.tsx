import { useState, useEffect } from "react";

const shapes = ["circle", "triangle", "rect"];

export default function Loader() {
  const [shape, setShape] = useState(
    () => shapes[Math.floor(Math.random() * shapes.length)],
  );

  //   useEffect(() => {
  //     const id = setInterval(() => {
  //       setShape(shapes[Math.floor(Math.random() * shapes.length)]);
  //     }, 3000);
  //     return () => clearInterval(id);
  //   }, []);

  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "10px",
    strokeLinejoin: "round",
    strokeLinecap: "round",
  };

  const dot =
    "w-[6px] h-[6px] rounded-full absolute block top-[37px] left-[19px] bg-black";

  return (
    <div className="flex items-center justify-center border">
      {shape === "circle" && (
        <div className="w-[44px] h-[44px] relative inline-block">
          <div
            className={`${dot}`}
            style={{
              transform: "translate(-18px,-18px)",
              animation:
                "dotCircle 3s cubic-bezier(0.785,0.135,0.15,0.86) infinite",
            }}
          />
          <svg viewBox="0 0 80 80" className="block w-full h-full text-black">
            <circle
              r={32}
              cy={40}
              cx={40}
              style={{
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "10px",
                strokeLinejoin: "round",
                strokeLinecap: "round",
                strokeDasharray: "150 50 150 50",
                strokeDashoffset: 75,
                animation:
                  "pathCircle 3s cubic-bezier(0.785,0.135,0.15,0.86) reverse infinite",
              }}
            />
          </svg>
        </div>
      )}
      {shape === "triangle" && (
        <div className="w-[48px] h-[44px] relative inline-block">
          <div
            className={`${dot} left-[21px]`}
            style={{
              animation:
                "dotTriangle 3s cubic-bezier(0.785,0.135,0.15,0.86) infinite",
            }}
          />
          <svg viewBox="0 0 86 80" className="block w-full h-full text-black">
            <polygon
              points="43 8 79 72 7 72"
              style={{
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "10px",
                strokeLinejoin: "round",
                strokeLinecap: "round",
                strokeDasharray: "145 76 145 76",
                strokeDashoffset: 0,
                animation:
                  "pathTriangle 3s cubic-bezier(0.785,0.135,0.15,0.86) reverse infinite",
              }}
            />
          </svg>
        </div>
      )}
      {shape === "rect" && (
        <div className=" relative inline-block">
          <div
            className={`${dot}`}
            style={{
              transform: "translate(-18px,-18px)",
              animation:
                "dotRect 3s cubic-bezier(0.785,0.135,0.15,0.86) infinite",
            }}
          />
          <svg viewBox="0 0 80 80" className="block w-full h-full text-black">
            <rect
              height={64}
              width={64}
              y={8}
              x={8}
              style={{
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "10px",
                strokeLinejoin: "round",
                strokeLinecap: "round",
                strokeDasharray: "192 64 192 64",
                strokeDashoffset: 0,
                animation:
                  "pathRect 3s cubic-bezier(0.785,0.135,0.15,0.86) reverse infinite",
              }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
