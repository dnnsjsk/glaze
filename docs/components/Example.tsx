"use client";

import { useEffect, useRef } from "react";
import glaze from "glazejs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export const Example = ({ children }: { children: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const refInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!refInnerRef.current) return;
    refInnerRef.current.innerHTML = children;
    glaze({
      lib: { gsap: { core: gsap } },
      element: ref.current,
      breakpoints: {
        sm: "(min-width: 640px)",
        lg: "(min-width: 1024px)",
      },
      presets: {
        helicopter: "from:rotate-2160|duration-5",
      },
    });
  }, [children]);

  return (
    <div ref={ref} suppressHydrationWarning>
      <div
        suppressHydrationWarning
        ref={refInnerRef}
        className="flex h-max w-full items-center justify-center overflow-hidden bg-fd-card p-12 md:rounded-xl"
      />
    </div>
  );
};
