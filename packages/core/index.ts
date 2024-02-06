import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { glaze } from "./src";

gsap.registerPlugin(ScrollTrigger);

glaze({
  lib: {
    gsap: { core: gsap },
  },
  breakpoints: {
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
  },
});
