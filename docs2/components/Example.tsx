import { ReactNode, useEffect, useRef } from "react";
import glaze from "glazejs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Example = ({ children }: { children: ReactNode }) => {
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
    <div ref={ref} className="-mx-6">
      <div
        className="flex h-max w-full items-center justify-center overflow-hidden bg-neutral-900 p-12 md:rounded-xl"
        dangerouslySetInnerHTML={content}
      />
    </div>
  );
};

export default Example;
