"use client";

import React, { useRef } from "react";
import { Confetti } from "@/components/ui/confetti";

export * from "@/components/ui/confetti";
export { default } from "@/components/ui/confetti";

export function ConfettiDemo() {
  const confettiRef = useRef(null);

  return (
    <div className="bg-background relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border">
      <span className="pointer-events-none bg-linear-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl leading-none font-semibold whitespace-pre-wrap text-transparent dark:from-white dark:to-slate-900/10">
        Confetti
      </span>

      <Confetti
        ref={confettiRef}
        className="absolute top-0 left-0 z-0 size-full"
        onMouseEnter={() => {
          confettiRef.current?.fire({});
        }}
      />
    </div>
  );
}
