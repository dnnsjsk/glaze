import { useEffect, useRef } from "react";
import { glaze } from "glaze";
import gsap from "gsap";

const Example = ({ children }) => {
  const ref = useRef(null);
  const isString = typeof children === "string";
  const content = isString ? { __html: children } : null;

  useEffect(() => {
    const { ScrollTrigger } = require("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);

    glaze({
      lib: { gsap: { core: gsap } },
      element: ref.current,
      breakpoints: {
        sm: "(min-width: 640px)",
        lg: "(min-width: 1024px)",
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
