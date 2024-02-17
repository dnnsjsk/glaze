import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import glaze from "./src";

gsap.registerPlugin(ScrollTrigger);

const { timelines } = glaze({
  breakpoints: {
    lg: "(min-width: 1024px)",
  },
  lib: {
    gsap: { core: gsap },
  },
  watch: true,
});

setTimeout(() => {
  const tl = timelines[0];

  for (const [element] of tl.elements) {
    if (!element) continue;
    const animateObject = element.getAttribute("data-animate");
    if (!animateObject) continue;
    element.setAttribute("data-animate", animateObject.replace("red", "pink"));
  }
}, 5000);
