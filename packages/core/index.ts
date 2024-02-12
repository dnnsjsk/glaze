import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import glaze from "./src";

gsap.registerPlugin(ScrollTrigger);

glaze({
  breakpoints: {
    lg: "(min-width: 1024px)",
  },
  lib: {
    gsap: { core: gsap },
  },
  watch: true,
});
