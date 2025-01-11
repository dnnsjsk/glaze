"use client";

import { ReactNode, useEffect, useRef } from "react";
import glaze from "glazejs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export const Example = ({ children }: { children: ReactNode }) => {
  const ref = useRef(null);
  const isString = typeof children === "string";
  const content = isString ? { __html: children } : { __html: "" };

  useEffect(() => {
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
  }, []);

  return (
    <div ref={ref} suppressHydrationWarning>
      <div
        suppressHydrationWarning
        className="flex h-max w-full items-center justify-center overflow-hidden bg-fd-card p-12 md:rounded-xl"
        dangerouslySetInnerHTML={content}
      />
    </div>
  );
};
