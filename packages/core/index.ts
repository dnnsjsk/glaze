import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import glaze from "./src";

gsap.registerPlugin(ScrollTrigger);

const { timelines } = glaze({
  breakpoints: {
    default: "(min-width: 640px)",
    lg: "(min-width: 1024px)",
  },
  lib: {
    gsap: { core: gsap },
  },
  className: "animate",
  watch: true,
});

setTimeout(() => {
  const tl = timelines[timelines.length - 1];

  for (const [element] of tl.elements) {
    if (!element) continue;
    const animateObject = element.getAttribute("data-animate");
    if (animateObject) {
      element.setAttribute(
        "data-animate",
        animateObject.replace("yellow", "pink"),
      );
    }
    const classes = element.getAttribute("class") || "";
    if (classes) {
      element.setAttribute("class", classes.replace("yellow", "pink"));
    }
  }
}, 1000);
