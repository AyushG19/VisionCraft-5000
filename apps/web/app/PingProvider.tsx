"use client";

import { useEffect, useRef, useState } from "react";
import { pingAllBackend } from "./api/ping";

export function PingProvider() {
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const textRef = useRef<HTMLDivElement | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startInterval() {
    let limit = 3;
    intervalIdRef.current = setInterval(() => {
      if (!textRef.current) return;
      if (limit <= 0) {
        textRef.current.innerText = "waking up backend";
        limit = 3;
      } else {
        limit--;
        textRef.current.append(".");
      }
    }, 1000);
  }
  useEffect(() => {
    const promise = pingAllBackend();
    startInterval();
    setLoading(true);
    promise.then(() => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="absolute top-2 right-2 z-100 min-w-60 max-w-70 h-fit px-6 py-4 rounded-xl bg-easy-blue ouline-1 outline-global-shadow shadow-primary text-canvas-contrast ">
        <button
          onClick={() => setShowDescription((prev) => !prev)}
          className="inline-flex items-center justify-center italic rounded-full w-4 h-4 outline-1 outline-easy-light-blue  text-white/80 text-xs font-sans mr-2 hover:outline-2 cursor-pointer"
        >
          i
        </button>
        <span
          ref={textRef}
          className="capitalize font-google-sans-code font-semibold text-easy-light-blue text-sm"
        >
          waking up backend
        </span>

        {showDescription && (
          <p className="font-handlee text-black mt-2 text-balance">
            Hey there! Please wait a bit, i use a free instance so the thing
            just keeps sleeping. It will be up in 30 - 60 sec.
            <br />
            Thank you!
          </p>
        )}
      </div>
    );
}
