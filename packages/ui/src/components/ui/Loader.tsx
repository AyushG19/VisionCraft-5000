import React, { useRef } from "react";

const Loader = () => {
  const shapes = ["triangle", "circle", "rect"];
  const shape = useRef(shapes[Math.floor(Math.random() * shapes.length)]);
  return (
    <>
      <style>{`
        .loader-dot::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: absolute;
          display: block;
          top: 37px;
          left: 19px;
          transform: translate(-18px, -18px);
          animation: dotRect 3s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
        }
        .loader-triangle::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: absolute;
          display: block;
          top: 37px;
          left: 21px;
          transform: translate(-10px, -18px);
          animation: dotTriangle 3s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
        }
        .loader-svg-polygon {
          stroke-dasharray: 145 76 145 76;
          stroke-dashoffset: 0;
          animation: pathTriangle 3s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
        }
        .loader-svg-rect {
          stroke-dasharray: 192 64 192 64;
          stroke-dashoffset: 0;
          animation: pathRect 3s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
        }
        .loader-svg-circle {
          stroke-dasharray: 150 50 150 50;
          stroke-dashoffset: 75;
          animation: pathCircle 3s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
        }
        @keyframes pathTriangle {
          33% { stroke-dashoffset: 74; }
          66% { stroke-dashoffset: 147; }
          100% { stroke-dashoffset: 221; }
        }
        @keyframes dotTriangle {
          33% { transform: translate(0, 0); }
          66% { transform: translate(10px, -18px); }
          100% { transform: translate(-10px, -18px); }
        }
        @keyframes pathRect {
          25% { stroke-dashoffset: 64; }
          50% { stroke-dashoffset: 128; }
          75% { stroke-dashoffset: 192; }
          100% { stroke-dashoffset: 256; }
        }
        @keyframes dotRect {
          25% { transform: translate(0, 0); }
          50% { transform: translate(18px, -18px); }
          75% { transform: translate(0, -36px); }
          100% { transform: translate(-18px, -18px); }
        }
        @keyframes pathCircle {
          25% { stroke-dashoffset: 125; }
          50% { stroke-dashoffset: 175; }
          75% { stroke-dashoffset: 225; }
          100% { stroke-dashoffset: 275; }
        }
      `}</style>

      <div className="flex scale-55">
        {shape.current === "circle" && (
          <div className="loader-dot before:bg-canvas relative w-11 h-11 inline-block">
            <svg viewBox="0 0 80 80" className="block w-full h-full">
              <circle
                r={32}
                cy={40}
                cx={40}
                className="loader-svg-circle fill-none stroke-primary-contrast [stroke-width:10px] [stroke-linejoin:round] [stroke-linecap:round]"
              />
            </svg>
          </div>
        )}
        {shape.current === "triangle" && (
          <div className="loader-triangle before:bg-canvas relative w-12 h-11 inline-block">
            <svg viewBox="0 0 86 80" className="block w-full h-full">
              <polygon
                points="43 8 79 72 7 72"
                className="loader-svg-polygon fill-none stroke-primary-contrast [stroke-width:10px] [stroke-linejoin:round] [stroke-linecap:round]"
              />
            </svg>
          </div>
        )}
        {shape.current === "rect" && (
          <div className="loader-dot before:bg-canvas relative w-11 h-11 inline-block">
            <svg viewBox="0 0 80 80" className="block w-full h-full">
              <rect
                height={64}
                width={64}
                y={8}
                x={8}
                className="loader-svg-rect fill-none stroke-primary-contrast [stroke-width:10px] [stroke-linejoin:round] [stroke-linecap:round]"
              />
            </svg>
          </div>
        )}
      </div>
    </>
  );
};

export default Loader;
