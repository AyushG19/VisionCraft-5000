"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { IconCursorText } from "@tabler/icons-react";

export default function MotionTypewriter({
  words,
  speed = 0.1, // Adjusted default to feel natural
  pauseDuration = 2000,
}: {
  words: string[];
  speed?: number;
  pauseDuration?: number;
}) {
  const [index, setIndex] = useState(0);
  const currentWord = words[index] || "disigner";

  // A motion value that tracks a number from 0 to the length of the word
  const count = useMotionValue(0);

  // This automatically slices the string based on the current number!
  const displayText = useTransform(count, (latest) =>
    currentWord.slice(0, Math.round(latest)),
  );

  useEffect(() => {
    let isMounted = true; // Cleanup flag to prevent memory leaks

    const runAnimation = async () => {
      // 1. Type the word forwards
      await animate(count, currentWord.length, {
        type: "tween",
        duration: currentWord.length * speed,
        ease: "linear",
      });

      if (!isMounted) return;

      // 2. Pause while the user reads it
      await new Promise((resolve) => setTimeout(resolve, pauseDuration));

      if (!isMounted) return;

      // 3. Delete the word backwards (slightly faster)
      await animate(count, 0, {
        type: "tween",
        duration: currentWord.length * (speed / 1.5),
        ease: "linear",
      });

      if (!isMounted) return;

      // 4. Move to the next word in the array
      setIndex((prev) => (prev + 1) % words.length);
    };

    runAnimation();

    return () => {
      isMounted = false; // Stops animation loops if the component unmounts
    };
  }, [index, currentWord, pauseDuration, speed, words.length, count]);

  return (
    <span className="font-krona-one text-[50px] leading-none text-[#E7E3F3] text-shadow-generic flex items-center justify-center h-full w-full bg-easy-pink shadow-primary capitalize pb-3">
      {/* The mathematically animating text */}
      <motion.span>{displayText}</motion.span>

      {/* The Blinking Cursor */}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
        }}
      >
        <IconCursorText
          className="mt-3 -mx-2"
          color="#000000"
          // 🟢 2. The OUTLINE color (e.g., Black)
          stroke="#000000"
          // 🟢 3. The OUTLINE thickness
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          size={60}
        />
      </motion.span>
    </span>
  );
}
