import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Glaze } from "./src";

gsap.registerPlugin(ScrollTrigger);

console.log('hi')

new Glaze({
  gsap: { core: gsap },
  breakpoints: {
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
  },
});
